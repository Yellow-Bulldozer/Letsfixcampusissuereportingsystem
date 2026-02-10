import { useState } from 'react';
import { User, Issue, UserRole, IssueStatus, Vote } from './types';
import { mockUsers, mockIssues, mockVotes } from './data/mock-data';
import { Login } from './components/login';
import { Header } from './components/header';
import { StudentDashboard } from './components/student-dashboard';
import { ReportIssueForm } from './components/report-issue-form';
import { VotingSystem } from './components/voting-system';
import { AdminDashboard } from './components/admin-dashboard';
import { AuthorityDashboard } from './components/authority-dashboard';
import { DayBanner } from './components/day-banner';
import { isSaturday, isWeekday } from './utils/date-utils';
import { Calendar, LayoutDashboard, Vote as VoteIcon } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [issues, setIssues] = useState<Issue[]>(mockIssues);
  const [votes, setVotes] = useState<Vote[]>(mockVotes);
  const [showReportForm, setShowReportForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'voting'>('dashboard');

  const handleLogin = (userId: string, role: UserRole) => {
    const user = mockUsers.find(u => u.id === userId && u.role === role);
    if (user) {
      setCurrentUser(user);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const handleReportIssue = (issueData: {
    title: string;
    description: string;
    category: Issue['category'];
    location: Issue['location'];
  }) => {
    const newIssue: Issue = {
      id: String(issues.length + 1),
      title: issueData.title,
      description: issueData.description,
      category: issueData.category,
      location: issueData.location,
      images: [],
      status: 'pending',
      reportedBy: currentUser?.name || 'Anonymous',
      reportedAt: new Date(),
      votes: 0,
      updatedAt: new Date()
    };

    setIssues([newIssue, ...issues]);
    setShowReportForm(false);
  };

  const handleVote = (issueId: string) => {
    if (!currentUser) return;

    // Check if user already voted
    const existingVote = votes.find(v => v.userId === currentUser.id);
    if (existingVote) return;

    // Add vote
    const newVote: Vote = {
      userId: currentUser.id,
      issueId: issueId,
      votedAt: new Date()
    };
    setVotes([...votes, newVote]);

    // Update issue vote count
    setIssues(issues.map(issue => 
      issue.id === issueId 
        ? { ...issue, votes: issue.votes + 1 }
        : issue
    ));
  };

  const handleUpdateStatus = (issueId: string, newStatus: IssueStatus) => {
    setIssues(issues.map(issue =>
      issue.id === issueId
        ? { ...issue, status: newStatus, updatedAt: new Date() }
        : issue
    ));
  };

  // Check if current user has voted
  const userVotedIssueId = currentUser 
    ? votes.find(v => v.userId === currentUser.id)?.issueId || null
    : null;

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        userName={currentUser.name}
        userRole={currentUser.role}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student View */}
        {currentUser.role === 'student' && (
          <>
            {/* Tab Navigation */}
            <div className="mb-6 bg-white rounded-xl border border-gray-200 p-2 inline-flex gap-2">
              <button
                onClick={() => setActiveTab('dashboard')}
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
                onClick={() => setActiveTab('voting')}
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
            ) : (
              <VotingSystem
                issues={issues}
                userVotedIssueId={userVotedIssueId}
                onVote={handleVote}
              />
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
        {currentUser.role === 'admin' && (
          <AdminDashboard
            issues={issues}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {/* Authority View */}
        {currentUser.role === 'authority' && (
          <AuthorityDashboard
            issues={issues}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </main>
    </div>
  );
}