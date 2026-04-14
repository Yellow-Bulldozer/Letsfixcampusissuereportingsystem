import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Issue } from '../types';
import {
  startCustomPoll,
  closePoll as closePollApi,
  getAllPolls,
  getActivePollFull
} from '../lib/api';
import {
  Play,
  Clock,
  CheckCircle,
  XCircle,
  Timer,
  Trophy,
  BarChart3,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Zap,
  Search
} from 'lucide-react';

interface PollManagerProps {
  issues: Issue[];
  onPollStarted: () => void;
}

type ActivePoll = {
  _id: string;
  pollStartDate: string;
  pollEndDate: string;
  isActive: boolean;
  isClosed: boolean;
  totalVotes: number;
  issues: Array<{ _id: string; title: string; category: string; voteCount?: number }>;
};

type PastPoll = {
  _id: string;
  pollStartDate: string;
  pollEndDate: string;
  isActive: boolean;
  isClosed: boolean;
  totalVotes: number;
  issues: Array<{ _id: string; title: string; category: string; status: string }>;
  winningIssue?: { _id: string; title: string; category: string } | null;
  createdAt: string;
};

const DURATION_PRESETS = [
  { label: '1 Hour', value: 1 },
  { label: '2 Hours', value: 2 },
  { label: '6 Hours', value: 6 },
  { label: '12 Hours', value: 12 },
  { label: '24 Hours', value: 24 },
  { label: '48 Hours', value: 48 },
];

function useCountdown(endDate: string | null) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!endDate) return;

    const tick = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return timeLeft;
}

export function PollManager({ issues, onPollStarted }: PollManagerProps) {
  const [activePoll, setActivePoll] = useState<ActivePoll | null>(null);
  const [pastPolls, setPastPolls] = useState<PastPoll[]>([]);
  const [selectedIssueIds, setSelectedIssueIds] = useState<Set<string>>(new Set());
  const [durationHours, setDurationHours] = useState(24);
  const [customDuration, setCustomDuration] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPastPolls, setShowPastPolls] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const countdown = useCountdown(activePoll?.pollEndDate ?? null);

  const loadData = useCallback(async () => {
    try {
      const [active, all] = await Promise.all([
        getActivePollFull(),
        getAllPolls()
      ]);
      setActivePoll(active as ActivePoll | null);
      setPastPolls((all || []) as PastPoll[]);
    } catch {
      // Silently handle
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Only show verified + non-merged issues that aren't already in an active poll
  const eligibleIssues = useMemo(() => {
    const activePollIssueIds = new Set(
      (activePoll?.issues || []).map(i => i._id)
    );
    return issues.filter(
      i =>
        i.status === 'verified' &&
        !i.mergedInto &&
        !activePollIssueIds.has(i.id)
    );
  }, [issues, activePoll]);

  const filteredEligible = useMemo(() => {
    if (!searchQuery.trim()) return eligibleIssues;
    const q = searchQuery.toLowerCase();
    return eligibleIssues.filter(
      i =>
        i.title.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.location.block.toLowerCase().includes(q)
    );
  }, [eligibleIssues, searchQuery]);

  const toggleIssue = (id: string) => {
    setSelectedIssueIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIssueIds.size === filteredEligible.length) {
      setSelectedIssueIds(new Set());
    } else {
      setSelectedIssueIds(new Set(filteredEligible.map(i => i.id)));
    }
  };

  const handleStartPoll = async () => {
    if (selectedIssueIds.size === 0) {
      setError('Select at least one issue for the poll');
      return;
    }

    const dur = isCustom ? parseInt(customDuration) : durationHours;
    if (!dur || dur < 1 || dur > 168) {
      setError('Duration must be between 1 and 168 hours');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await startCustomPoll(Array.from(selectedIssueIds), dur);
      setSuccess(result.message);
      setSelectedIssueIds(new Set());
      await loadData();
      onPollStarted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start poll');
    } finally {
      setLoading(false);
    }
  };

  const handleClosePoll = async () => {
    if (!activePoll) return;

    setLoading(true);
    setError(null);

    try {
      await closePollApi(activePoll._id);
      setSuccess('Poll closed successfully');
      setActivePoll(null);
      await loadData();
      onPollStarted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close poll');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{success}</span>
            <button onClick={() => setSuccess(null)} className="ml-auto">
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Poll Section */}
      {activePoll && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl border border-indigo-200 overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-indigo-100">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Active Poll</h2>
                  <p className="text-sm text-gray-500">
                    Started {formatDateTime(activePoll.pollStartDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-indigo-100">
                  <Timer className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-indigo-700 tabular-nums">
                    {countdown}
                  </span>
                </div>

                <button
                  onClick={handleClosePoll}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  <XCircle className="w-4 h-4" />
                  Close Poll
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-indigo-700">{activePoll.issues.length}</p>
                <p className="text-xs text-gray-500 mt-1">Issues</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-emerald-700">
                  {activePoll.issues.reduce((s, i) => s + (i.voteCount || 0), 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Total Votes</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-amber-700">
                  {formatDateTime(activePoll.pollEndDate).split(',').slice(0, 2).join(',')}
                </p>
                <p className="text-xs text-gray-500 mt-1">Ends At</p>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-gray-700 mb-3">Poll Issues</h3>
            <div className="space-y-2">
              {activePoll.issues.map((issue, idx) => (
                <div
                  key={issue._id}
                  className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-5">#{idx + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{issue.title}</p>
                      <p className="text-xs text-gray-500 capitalize">{issue.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700">
                      {issue.voteCount || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Create New Poll Section */}
      {!activePoll && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Create New Poll</h2>
                <p className="text-sm text-gray-500">Select verified issues and set poll duration</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Duration Selector */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 block">
                <Clock className="w-4 h-4 inline mr-1.5 text-gray-400" />
                Poll Duration
              </label>
              <div className="flex flex-wrap gap-2">
                {DURATION_PRESETS.map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => {
                      setDurationHours(preset.value);
                      setIsCustom(false);
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      !isCustom && durationHours === preset.value
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  onClick={() => setIsCustom(true)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isCustom
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Custom
                </button>
              </div>

              {isCustom && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 flex items-center gap-2"
                >
                  <input
                    type="number"
                    min={1}
                    max={168}
                    value={customDuration}
                    onChange={e => setCustomDuration(e.target.value)}
                    placeholder="e.g. 36"
                    className="w-28 px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                  <span className="text-sm text-gray-500">hours (max 168)</span>
                </motion.div>
              )}
            </div>

            {/* Issue Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">
                  Select Issues ({selectedIssueIds.size}/{filteredEligible.length})
                </label>
                <button
                  onClick={selectAll}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {selectedIssueIds.size === filteredEligible.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {/* Search bar */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by title, category, or location..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              {filteredEligible.length === 0 ? (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
                  <p className="text-sm text-gray-500">No verified issues available for polling</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {filteredEligible.map(issue => (
                    <label
                      key={issue.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedIssueIds.has(issue.id)
                          ? 'bg-indigo-50 border-indigo-300'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIssueIds.has(issue.id)}
                        onChange={() => toggleIssue(issue.id)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{issue.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500 capitalize">{issue.category}</span>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs text-gray-500">
                            {issue.location.block}, {issue.location.floor}
                          </span>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs text-gray-400">
                            {new Date(issue.reportedAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short'
                            })}
                          </span>
                        </div>
                      </div>
                      {(issue.mergedChildren?.length || 0) > 0 && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                          +{issue.mergedChildren!.length} merged
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartPoll}
              disabled={loading || selectedIssueIds.size === 0}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-indigo-200"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              Start Poll ({selectedIssueIds.size} issue{selectedIssueIds.size !== 1 ? 's' : ''}, {isCustom ? customDuration || '?' : durationHours}h)
            </button>
          </div>
        </motion.div>
      )}

      {/* Past Polls History */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => setShowPastPolls(!showPastPolls)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-600" />
            <span className="font-semibold text-gray-900">Poll History</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {pastPolls.filter(p => p.isClosed).length}
            </span>
          </div>
          {showPastPolls ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        <AnimatePresence>
          {showPastPolls && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-5 space-y-3">
                {pastPolls.filter(p => p.isClosed).length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">No past polls yet</p>
                ) : (
                  pastPolls
                    .filter(p => p.isClosed)
                    .map(poll => (
                      <div
                        key={poll._id}
                        className="bg-gray-50 rounded-xl border border-gray-200 p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {formatDateTime(poll.pollStartDate)}
                            </p>
                            <p className="text-xs text-gray-500">
                              → {formatDateTime(poll.pollEndDate)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-800">
                              {poll.totalVotes} votes
                            </p>
                            <p className="text-xs text-gray-500">
                              {poll.issues.length} issues
                            </p>
                          </div>
                        </div>

                        {poll.winningIssue && (
                          <div className="mt-2 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                            <Trophy className="w-4 h-4 text-amber-600" />
                            <span className="text-xs font-medium text-amber-800">
                              Winner: {poll.winningIssue.title}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
