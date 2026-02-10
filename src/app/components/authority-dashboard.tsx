import { useMemo, useState } from 'react';
import { Issue, IssueStatus } from '../types';
import { IssueCard } from './issue-card';
import { Trophy, TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { formatDate } from '../utils/date-utils';

interface AuthorityDashboardProps {
  issues: Issue[];
  onUpdateStatus: (issueId: string, newStatus: IssueStatus) => void;
}

export function AuthorityDashboard({ issues, onUpdateStatus }: AuthorityDashboardProps) {
  const [selectedView, setSelectedView] = useState<'priority' | 'all'>('priority');

  const topPriorityIssue = useMemo(() => {
    const verifiedIssues = issues.filter(i => i.status === 'verified');
    return verifiedIssues.sort((a, b) => b.votes - a.votes)[0];
  }, [issues]);

  const stats = useMemo(() => {
    return {
      total: issues.length,
      pending: issues.filter(i => i.status === 'pending').length,
      verified: issues.filter(i => i.status === 'verified').length,
      ongoing: issues.filter(i => i.status === 'ongoing').length,
      completed: issues.filter(i => i.status === 'completed').length
    };
  }, [issues]);

  const ongoingIssues = useMemo(() => {
    return issues.filter(i => i.status === 'ongoing').sort((a, b) => b.votes - a.votes);
  }, [issues]);

  const verifiedIssues = useMemo(() => {
    return issues.filter(i => i.status === 'verified').sort((a, b) => b.votes - a.votes);
  }, [issues]);

  const completedIssues = useMemo(() => {
    return issues.filter(i => i.status === 'completed').sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [issues]);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6" />
            <p className="text-sm text-blue-100">Active Issues</p>
          </div>
          <p className="text-3xl font-bold">{stats.verified + stats.ongoing}</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6" />
            <p className="text-sm text-orange-100">In Progress</p>
          </div>
          <p className="text-3xl font-bold">{stats.ongoing}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6" />
            <p className="text-sm text-green-100">Completed</p>
          </div>
          <p className="text-3xl font-bold">{stats.completed}</p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6" />
            <p className="text-sm text-yellow-100">Pending Review</p>
          </div>
          <p className="text-3xl font-bold">{stats.pending}</p>
        </div>
      </div>

      {/* Top Priority Issue */}
      {topPriorityIssue && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Top Priority Issue This Week</h2>
              <p className="text-blue-100">Highest voted issue - Requires immediate attention</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-1">
            <IssueCard issue={topPriorityIssue} showVotes />
          </div>

          {topPriorityIssue.status === 'verified' && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => onUpdateStatus(topPriorityIssue.id, 'ongoing')}
                className="flex-1 bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Start Working on This Issue
              </button>
            </div>
          )}
          
          {topPriorityIssue.status === 'ongoing' && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => onUpdateStatus(topPriorityIssue.id, 'completed')}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Mark as Completed
              </button>
            </div>
          )}
        </div>
      )}

      {/* View Toggle */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedView('priority')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-medium transition-colors ${
              selectedView === 'priority'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Priority View
          </button>
          <button
            onClick={() => setSelectedView('all')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-medium transition-colors ${
              selectedView === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Issues
          </button>
        </div>
      </div>

      {/* Issues Content */}
      {selectedView === 'priority' ? (
        <div className="space-y-6">
          {/* Ongoing Issues */}
          {ongoingIssues.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Currently In Progress ({ongoingIssues.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {ongoingIssues.map(issue => (
                  <div key={issue.id} className="space-y-3">
                    <IssueCard issue={issue} showVotes />
                    <button
                      onClick={() => onUpdateStatus(issue.id, 'completed')}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark as Completed
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verified Issues - High Priority */}
          {verifiedIssues.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Verified Issues - Awaiting Action ({verifiedIssues.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {verifiedIssues.map(issue => (
                  <div key={issue.id} className="space-y-3">
                    <IssueCard issue={issue} showVotes />
                    <button
                      onClick={() => onUpdateStatus(issue.id, 'ongoing')}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                      Start Working
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recently Completed */}
          {completedIssues.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Recently Completed ({completedIssues.slice(0, 4).length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {completedIssues.slice(0, 4).map(issue => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">All Issues ({issues.length})</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {issues.map(issue => (
              <div key={issue.id} className="space-y-3">
                <IssueCard issue={issue} showVotes />
                {issue.status === 'verified' && (
                  <button
                    onClick={() => onUpdateStatus(issue.id, 'ongoing')}
                    className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Start Working
                  </button>
                )}
                {issue.status === 'ongoing' && (
                  <button
                    onClick={() => onUpdateStatus(issue.id, 'completed')}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
