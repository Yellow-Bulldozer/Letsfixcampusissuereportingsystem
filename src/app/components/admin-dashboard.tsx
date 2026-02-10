import { useState, useMemo } from 'react';
import { Issue, IssueStatus } from '../types';
import { CheckCircle, XCircle, Edit, Eye, Filter, BarChart3, Users, AlertTriangle } from 'lucide-react';
import { IssueCard } from './issue-card';
import { formatDate } from '../utils/date-utils';

interface AdminDashboardProps {
  issues: Issue[];
  onUpdateStatus: (issueId: string, newStatus: IssueStatus) => void;
}

export function AdminDashboard({ issues, onUpdateStatus }: AdminDashboardProps) {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');

  const stats = useMemo(() => {
    return {
      total: issues.length,
      pending: issues.filter(i => i.status === 'pending').length,
      verified: issues.filter(i => i.status === 'verified').length,
      ongoing: issues.filter(i => i.status === 'ongoing').length,
      completed: issues.filter(i => i.status === 'completed').length
    };
  }, [issues]);

  const filteredIssues = useMemo(() => {
    if (statusFilter === 'all') return issues;
    return issues.filter(i => i.status === statusFilter);
  }, [issues, statusFilter]);

  const handleStatusChange = (issueId: string, newStatus: IssueStatus) => {
    onUpdateStatus(issueId, newStatus);
    setSelectedIssue(null);
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <p className="text-sm text-gray-600">Total Issues</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <p className="text-sm text-yellow-700">Pending</p>
          </div>
          <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
        </div>
        
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-700">Verified</p>
          </div>
          <p className="text-3xl font-bold text-blue-700">{stats.verified}</p>
        </div>
        
        <div className="bg-orange-50 rounded-xl border border-orange-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Edit className="w-5 h-5 text-orange-600" />
            <p className="text-sm text-orange-700">Ongoing</p>
          </div>
          <p className="text-3xl font-bold text-orange-700">{stats.ongoing}</p>
        </div>
        
        <div className="bg-green-50 rounded-xl border border-green-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700">Completed</p>
          </div>
          <p className="text-3xl font-bold text-green-700">{stats.completed}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'verified', 'ongoing', 'completed'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Manage Issues ({filteredIssues.length})
        </h2>
        
        {filteredIssues.length > 0 ? (
          <div className="space-y-4">
            {filteredIssues.map(issue => (
              <div
                key={issue.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <IssueCard issue={issue} showVotes />
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Update Status:</span>
                    
                    {issue.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(issue.id, 'verified')}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Verify Issue
                        </button>
                        <button
                          onClick={() => setSelectedIssue(issue)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                    
                    {issue.status === 'verified' && (
                      <button
                        onClick={() => handleStatusChange(issue.id, 'ongoing')}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Mark as Ongoing
                      </button>
                    )}
                    
                    {issue.status === 'ongoing' && (
                      <button
                        onClick={() => handleStatusChange(issue.id, 'completed')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark as Completed
                      </button>
                    )}
                    
                    <button
                      onClick={() => setSelectedIssue(issue)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No issues found with the selected filter.</p>
          </div>
        )}
      </div>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Issue Details</h2>
              <button
                onClick={() => setSelectedIssue(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Title</h3>
                <p className="text-gray-900">{selectedIssue.title}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Description</h3>
                <p className="text-gray-900">{selectedIssue.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Category</h3>
                  <p className="text-gray-900">{selectedIssue.category}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Status</h3>
                  <p className="text-gray-900 capitalize">{selectedIssue.status}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Location</h3>
                <p className="text-gray-900">
                  {selectedIssue.location.block}, {selectedIssue.location.floor}, {selectedIssue.location.room}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Reported By</h3>
                  <p className="text-gray-900">{selectedIssue.reportedBy}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Reported At</h3>
                  <p className="text-gray-900">{formatDate(selectedIssue.reportedAt)}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Votes</h3>
                <p className="text-gray-900">{selectedIssue.votes} votes</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
