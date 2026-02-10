import { useState, useMemo } from 'react';
import { Issue } from '../types';
import { IssueCard } from './issue-card';
import { ThumbsUp, Trophy, Calendar, AlertCircle } from 'lucide-react';
import { getCurrentDay, isSaturday } from '../utils/date-utils';

interface VotingSystemProps {
  issues: Issue[];
  userVotedIssueId: string | null;
  onVote: (issueId: string) => void;
}

export function VotingSystem({ issues, userVotedIssueId, onVote }: VotingSystemProps) {
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(userVotedIssueId);
  const currentDay = getCurrentDay();
  const isVotingDay = isSaturday();

  // Only show verified issues for voting
  const verifiedIssues = useMemo(() => {
    return issues
      .filter(issue => issue.status === 'verified')
      .sort((a, b) => b.votes - a.votes);
  }, [issues]);

  const topIssue = verifiedIssues[0];
  const hasVoted = userVotedIssueId !== null;

  const handleVote = () => {
    if (selectedIssueId && !hasVoted) {
      onVote(selectedIssueId);
    }
  };

  if (!isVotingDay) {
    return (
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Voting Opens on Saturday</h3>
              <p className="text-blue-700">
                Today is <span className="font-semibold">{currentDay}</span>. The weekly poll will be available on Saturday for 24 hours. 
                You'll be able to vote for the most critical issue that needs immediate attention.
              </p>
            </div>
          </div>
        </div>

        {/* Preview of Issues */}
        {verifiedIssues.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Issues Eligible for Voting</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {verifiedIssues.slice(0, 4).map(issue => (
                <IssueCard key={issue.id} issue={issue} showVotes />
              ))}
            </div>
            {verifiedIssues.length > 4 && (
              <p className="text-center text-gray-500 mt-4">
                +{verifiedIssues.length - 4} more issues
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Voting Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-lg">
            <Trophy className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">Weekly Priority Vote</h2>
        </div>
        <p className="text-blue-50">
          Vote for the issue you believe needs the most urgent attention. Poll closes in 24 hours.
        </p>
      </div>

      {/* Current Leader */}
      {topIssue && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-900">Current Top Priority</h3>
          </div>
          <IssueCard issue={topIssue} showVotes />
        </div>
      )}

      {/* Voting Status */}
      {hasVoted ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <ThumbsUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 mb-1">Vote Submitted!</h3>
              <p className="text-green-700">
                Thank you for participating. Check back after the poll closes to see the results.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Cast Your Vote</h3>
          <p className="text-gray-600 mb-4">
            Select the issue you think should be prioritized this week, then click "Submit Vote" below.
          </p>
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <AlertCircle className="w-4 h-4" />
            <span>You can only vote once. Choose carefully!</span>
          </div>
        </div>
      )}

      {/* Issues List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          All Verified Issues ({verifiedIssues.length})
        </h3>
        
        {verifiedIssues.length > 0 ? (
          <div className="space-y-4">
            {verifiedIssues.map(issue => (
              <div
                key={issue.id}
                onClick={() => !hasVoted && setSelectedIssueId(issue.id)}
                className={`relative ${!hasVoted ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
              >
                {!hasVoted && (
                  <div className="absolute left-6 top-6 z-10">
                    <input
                      type="radio"
                      checked={selectedIssueId === issue.id}
                      onChange={() => setSelectedIssueId(issue.id)}
                      className="w-5 h-5 text-blue-600 cursor-pointer"
                      disabled={hasVoted}
                    />
                  </div>
                )}
                <div className={!hasVoted ? 'ml-10' : ''}>
                  <IssueCard issue={issue} showVotes />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No verified issues available for voting yet.</p>
          </div>
        )}
      </div>

      {/* Vote Button */}
      {!hasVoted && verifiedIssues.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={handleVote}
              disabled={!selectedIssueId}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <ThumbsUp className="w-5 h-5" />
              Submit Vote
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
