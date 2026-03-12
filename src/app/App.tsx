import { useEffect, useState } from 'react';
import { User, Issue, UserRole, IssueStatus, Vote } from './types';
import { Login } from './components/login';
import { Header } from './components/header';
import { StudentDashboard } from './components/student-dashboard';
import { ReportIssueForm } from './components/report-issue-form';
import { VotingSystem } from './components/voting-system';
import { AdminDashboard } from './components/admin-dashboard';
import { AuthorityDashboard } from './components/authority-dashboard';
import { Profile } from './components/profile';
import { PostLoginContent } from './components/post-login-content';
import { isSaturday, isWeekday } from './utils/date-utils';
import { Calendar, LayoutDashboard, Vote as VoteIcon, UserCircle } from 'lucide-react';
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

const STUDENT_EMAIL_REGEX = /^[a-z0-9]+@grietcollege\.com$/i;

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showPostLoginContent, setShowPostLoginContent] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'voting' | 'profile'>('dashboard');
  const [userVotedIssueId, setUserVotedIssueId] = useState<string | null>(null);

  const hydrateDashboard = async (user: User) => {
    const [issuesFromApi, pollVoteMap] = await Promise.all([
      getIssues(),
      getActivePoll()
    ]);

    const mergedIssues = issuesFromApi.map((issue) => ({
      ...issue,
      votes: pollVoteMap.get(issue.id) ?? issue.votes
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
      setShowPostLoginContent(true);
      await hydrateDashboard(user);
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
      return 'Students must sign up using: rollno@grietcollege.com';
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
      setShowPostLoginContent(true);
      await hydrateDashboard(user);
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
    setActiveTab('dashboard');
    setShowPostLoginContent(false);
  };

  const handleTabChange = (tab: 'dashboard' | 'voting' | 'profile') => {
    setActiveTab(tab);
    setShowReportForm(false);
  };

  const handleReportIssue = async (issueData: {
    title: string;
    description: string;
    category: Issue['category'];
    location: Issue['location'];
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
    return <Login onSignIn={handleSignIn} onSignUp={handleSignUp} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        userName={currentUser.name}
        userRole={currentUser.role}
        onLogout={handleLogout}
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
            <div className="mb-6 bg-white rounded-xl border border-gray-200 p-2 inline-flex gap-2">
              <button
                onClick={() => handleTabChange('dashboard')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => handleTabChange('voting')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'voting'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <VoteIcon className="w-4 h-4" />
                Weekly Vote
                {isSaturday() && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    Live
                  </span>
                )}
              </button>
              <button
                onClick={() => handleTabChange('profile')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <UserCircle className="w-4 h-4" />
                Profile
              </button>
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
                issues={issues}
                onReportIssue={() => setShowReportForm(true)}
              />
            ) : activeTab === 'voting' ? (
              <VotingSystem
                issues={issues}
                userVotedIssueId={userVotedIssueId}
                onVote={handleVote}
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
            <div className="mb-6 bg-white rounded-xl border border-gray-200 p-2 inline-flex gap-2">
              <button
                onClick={() => handleTabChange('dashboard')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => handleTabChange('profile')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <UserCircle className="w-4 h-4" />
                Profile
              </button>
            </div>
            {activeTab === 'dashboard' ? (
              <AdminDashboard
                issues={issues}
                onUpdateStatus={handleUpdateStatus}
              />
            ) : (
              <Profile user={currentUser} issues={issues} votes={votes} />
            )}
          </>
        )}

        {/* Authority View */}
        {currentUser.role === 'authority' && !showPostLoginContent && (
          <>
            <div className="mb-6 bg-white rounded-xl border border-gray-200 p-2 inline-flex gap-2">
              <button
                onClick={() => handleTabChange('dashboard')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => handleTabChange('profile')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <UserCircle className="w-4 h-4" />
                Profile
              </button>
            </div>
            {activeTab === 'dashboard' ? (
              <AuthorityDashboard
                issues={issues}
                onUpdateStatus={handleUpdateStatus}
              />
            ) : (
              <Profile user={currentUser} issues={issues} votes={votes} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
