import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { User, Issue, UserRole, IssueStatus, Vote } from './types';
import { Homepage } from './components/homepage';
import { Login } from './components/login';
import { Header } from './components/header';
import { StudentDashboard } from './components/student-dashboard';
import { ReportIssueForm } from './components/report-issue-form';
import { VotingSystem } from './components/voting-system';
import { AdminDashboard } from './components/admin-dashboard';
import { AuthorityDashboard } from './components/authority-dashboard';
import { Profile } from './components/profile';
import { PostLoginContent } from './components/post-login-content';
import { PollManager } from './components/poll-manager';
import { IssueInbox } from './components/issue-inbox';
import { isSaturday, isWeekday } from './utils/date-utils';
import { Calendar, LayoutDashboard, Vote as VoteIcon, UserCircle, BarChart3, Inbox } from 'lucide-react';

import {
  castVote,
  clearToken,
  createIssue,
  getActivePoll,
  getCurrentUser,
  getIssues,
  getMyVoteIssueId,
  login,
  registerStudent,
  setToken,
  updateIssueStatus,
  verifyIssue
} from './lib/api';

const COLLEGE_EMAIL_DOMAIN = import.meta.env.VITE_COLLEGE_EMAIL_DOMAIN || 'college.edu';
const STUDENT_EMAIL_REGEX = new RegExp(`^[a-z0-9]+@${COLLEGE_EMAIL_DOMAIN.replace(/\./g, '\\.')}$`, 'i');

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showPostLoginContent, setShowPostLoginContent] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'voting' | 'profile' | 'polls' | 'inbox'>('dashboard');
  const [userVotedIssueId, setUserVotedIssueId] = useState<string | null>(null);
  const [showHomepage, setShowHomepage] = useState(true);
  const [hasActivePoll, setHasActivePoll] = useState(false);

  // Issues visible to students: only admin-verified (or beyond) issues
  const studentVisibleIssues = issues.filter(
    (i) => i.status === 'verified' || i.status === 'ongoing' || i.status === 'completed'
  );

  const hydrateDashboard = async (user: User) => {
    const [issuesFromApi, { pollExists, voteMap }] = await Promise.all([
      getIssues(),
      getActivePoll()
    ]);

    // Set live poll flag based on whether a poll is actually active
    setHasActivePoll(pollExists);

    const mergedIssues = issuesFromApi.map((issue) => ({
      ...issue,
      votes: voteMap.get(issue.id) ?? issue.votes
    }));

    setIssues(mergedIssues);

    if (user.role === 'student') {
      const myVotedIssueId = await getMyVoteIssueId();
      setUserVotedIssueId(myVotedIssueId);
      setVotes(
        myVotedIssueId
          ? [{ userId: user.id, issueId: myVotedIssueId, votedAt: new Date() }]
          : []
      );
    } else {
      setUserVotedIssueId(null);
      setVotes([]);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const user = await getCurrentUser();
        if (!isMounted) return;
        setCurrentUser(user);
        await hydrateDashboard(user);
      } catch {
        clearToken();
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSignIn = async (email: string, password: string, role: UserRole): Promise<string | null> => {
    try {
      const { token, user } = await login(email.trim().toLowerCase(), password);
      if (user.role !== role) {
        return `This account is '${user.role}'. Select the matching role to sign in.`;
      }
      setToken(token);
      setCurrentUser(user);
      await hydrateDashboard(user);
      setShowPostLoginContent(true);
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Sign in failed';
    }
  };

  const handleSignUp = async (payload: {
    name: string;
    email: string;
    collegeId: string;
    password: string;
    role: UserRole;
  }): Promise<string | null> => {
    const normalizedEmail = payload.email.trim().toLowerCase();

    if (payload.role !== 'student') {
      return 'Only student self-signup is enabled. Admin/Authority users must be created in the backend database.';
    }
    if (!STUDENT_EMAIL_REGEX.test(normalizedEmail)) {
      return `Students must sign up using: rollno@${COLLEGE_EMAIL_DOMAIN}`;
    }

    try {
      const { token, user } = await registerStudent({
        name: payload.name,
        email: normalizedEmail,
        password: payload.password,
        collegeId: payload.collegeId
      });
      setToken(token);
      setCurrentUser(user);
      await hydrateDashboard(user);
      setShowPostLoginContent(true);
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Sign up failed';
    }
  };

  const handleLogout = () => {
    clearToken();
    setCurrentUser(null);
    setIssues([]);
    setVotes([]);
    setUserVotedIssueId(null);
    setHasActivePoll(false);
    setActiveTab('dashboard');
    setShowPostLoginContent(false);
  };

  const handleTabChange = (tab: 'dashboard' | 'voting' | 'profile' | 'polls' | 'inbox') => {
    setActiveTab(tab);
    setShowReportForm(false);
  };

  const handleReportIssue = async (issueData: {
    title: string;
    description: string;
    category: Issue['category'];
    location: Issue['location'];
    images?: File[];
  }): Promise<string | null> => {
    if (!currentUser) return 'You must be signed in';
    try {
      const issue = await createIssue(issueData);
      setIssues((prev) => [issue, ...prev]);
      setShowReportForm(false);
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Unable to submit issue';
    }
  };

  const handleVote = (issueId: string) => {
    if (!currentUser || currentUser.role !== 'student' || userVotedIssueId) return;

    castVote(issueId)
      .then(() => {
        setUserVotedIssueId(issueId);
        setVotes([{ userId: currentUser.id, issueId, votedAt: new Date() }]);
        setIssues((prevIssues) =>
          prevIssues.map((issue) =>
            issue.id === issueId
              ? { ...issue, votes: issue.votes + 1 }
              : issue
          )
        );
      })
      .catch((error) => {
        alert(error instanceof Error ? error.message : 'Unable to cast vote');
      });
  };

  const handleUpdateStatus = (issueId: string, newStatus: IssueStatus) => {
    const updateCall =
      newStatus === 'verified'
        ? verifyIssue(issueId, true)
        : updateIssueStatus(issueId, newStatus);

    updateCall
      .then((updatedIssue) => {
        setIssues((prevIssues) =>
          prevIssues.map((issue) =>
            issue.id === issueId
              ? { ...issue, ...updatedIssue }
              : issue
          )
        );
      })
      .catch((error) => {
        alert(error instanceof Error ? error.message : 'Unable to update status');
      });
  };

  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    if (showHomepage) {
      const goToLogin = () => {
        setShowHomepage(false);
        window.scrollTo(0, 0);
      };
      return (
        <Homepage
          onGetStarted={goToLogin}
          onSignIn={goToLogin}
        />
      );
    }
    return <Login onSignIn={handleSignIn} onSignUp={handleSignUp} onGoHome={() => { setShowHomepage(true); window.scrollTo(0, 0); }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        userName={currentUser.name}
        userRole={currentUser.role}
        onLogout={handleLogout}
        onProfile={() => setActiveTab('profile')}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showPostLoginContent && (
          <PostLoginContent
            user={currentUser}
            issues={issues}
            onContinue={() => setShowPostLoginContent(false)}
            onReportIssue={() => {
              setShowPostLoginContent(false);
              setActiveTab('dashboard');
              if (currentUser.role === 'student') {
                setShowReportForm(true);
              }
            }}
            onViewVoteIssues={() => {
              setShowPostLoginContent(false);
              if (currentUser.role === 'student') {
                setActiveTab('voting');
                return;
              }
              setActiveTab('dashboard');
            }}
            onTrackMyIssues={() => {
              setShowPostLoginContent(false);
              setActiveTab('profile');
            }}
          />
        )}

        {/* Student View */}
        {currentUser.role === 'student' && !showPostLoginContent && (
          <>
            {/* Tab Navigation */}
            <div className="app-tab-nav mb-6">
              {[
                { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
                { id: 'voting', label: hasActivePoll ? 'Live Poll' : 'Weekly Vote', Icon: VoteIcon, live: hasActivePoll || isSaturday() },
                { id: 'profile', label: 'Profile', Icon: UserCircle },
              ].map(({ id, label, Icon, live }) => (
                <button
                  key={id}
                  onClick={() => handleTabChange(id as 'dashboard' | 'voting' | 'profile')}
                  className={`app-tab-btn ${activeTab === id ? 'active' : ''}`}
                >
                  {activeTab === id && (
                    <motion.div
                      layoutId="student-tab-indicator"
                      className="absolute inset-0 bg-[#1A1A2E]/8 rounded-[0.625rem]"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon className="w-4 h-4" />
                  {label}
                  {live && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">Live</span>
                  )}
                </button>
              ))}
            </div>

            {/* Weekday Info Banner for Reporting */}
            {activeTab === 'dashboard' && !isWeekday() && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-1">Issue Reporting Available Monday-Friday</h3>
                    <p className="text-sm text-yellow-700">
                      You can report new issues during weekdays. Use Saturday to vote on priority issues.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dashboard' ? (
              <StudentDashboard
                issues={studentVisibleIssues}
                onReportIssue={() => setShowReportForm(true)}
              />
            ) : activeTab === 'voting' ? (
              <VotingSystem
                issues={studentVisibleIssues}
                userVotedIssueId={userVotedIssueId}
                onVote={handleVote}
                hasActivePoll={hasActivePoll}
              />
            ) : (
              <Profile user={currentUser} issues={issues} votes={votes} />
            )}

            {showReportForm && (
              <ReportIssueForm
                onSubmit={handleReportIssue}
                onCancel={() => setShowReportForm(false)}
              />
            )}
          </>
        )}

        {/* Admin View */}
        {currentUser.role === 'admin' && !showPostLoginContent && (
          <>
            <div className="app-tab-nav mb-6">
              {[
                { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
                { id: 'polls', label: 'Poll Manager', Icon: BarChart3 },
                { id: 'inbox', label: 'Issue Inbox', Icon: Inbox },
                { id: 'profile', label: 'Profile', Icon: UserCircle },
              ].map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => handleTabChange(id as 'dashboard' | 'polls' | 'inbox' | 'profile')}
                  className={`app-tab-btn ${activeTab === id ? 'active' : ''}`}
                >
                  {activeTab === id && (
                    <motion.div
                      layoutId="admin-tab-indicator"
                      className="absolute inset-0 bg-[#1A1A2E]/8 rounded-[0.625rem]"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {activeTab === 'profile' ? (
              <Profile user={currentUser} issues={issues} votes={votes} />
            ) : activeTab === 'polls' ? (
              <PollManager
                issues={issues}
                onPollStarted={() => hydrateDashboard(currentUser!)}
              />
            ) : activeTab === 'inbox' ? (
              <IssueInbox
                issues={issues}
                onIssuesMerged={() => hydrateDashboard(currentUser!)}
                onNavigateToPoll={() => {
                  setActiveTab('polls');
                  // The PollManager will pick up these issues from the issues prop
                }}
              />
            ) : (
              <AdminDashboard
                issues={issues}
                onUpdateStatus={handleUpdateStatus}
              />
            )}
          </>
        )}

        {/* Authority View */}
        {currentUser.role === 'authority' && !showPostLoginContent && (
          <>
            <div className="app-tab-nav mb-6">
              {[
                { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
                { id: 'profile', label: 'Profile', Icon: UserCircle },
              ].map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => handleTabChange(id as 'dashboard' | 'profile')}
                  className={`app-tab-btn ${activeTab === id ? 'active' : ''}`}
                >
                  {activeTab === id && (
                    <motion.div
                      layoutId="authority-tab-indicator"
                      className="absolute inset-0 bg-[#1A1A2E]/8 rounded-[0.625rem]"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
            {activeTab === 'profile' ? (
              <Profile user={currentUser} issues={issues} votes={votes} />
            ) : (
              <AuthorityDashboard
                issues={issues}
                onUpdateStatus={handleUpdateStatus}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
