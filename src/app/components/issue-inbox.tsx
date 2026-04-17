import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Issue, IssueCategory } from '../types';
import { mergeIssues as mergeIssuesApi } from '../lib/api';
import {
  Inbox,
  Search,
  Filter,
  Calendar,
  MapPin,
  GitMerge,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowUpDown,
  Tag,
  ChevronDown,
  Layers,
  Eye
} from 'lucide-react';

interface IssueInboxProps {
  issues: Issue[];
  onIssuesMerged: () => void;
  onNavigateToPoll: (issueIds: string[]) => void;
}

type SortBy = 'newest' | 'oldest' | 'category' | 'location';

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  verified: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  ongoing: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  completed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
};

const CATEGORY_ICONS: Record<string, string> = {
  'Broken Furniture': '🪑',
  'Water Problem': '💧',
  'Electrical Fault': '⚡',
  'Washroom Hygiene': '🚻',
  'Classroom Maintenance': '📚',
  'Other': '📋',
};

export function IssueInbox({ issues, onIssuesMerged, onNavigateToPoll }: IssueInboxProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);
  const [mergeLoading, setMergeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewingIssue, setViewingIssue] = useState<Issue | null>(null);

  // Only show non-merged issues (merged ones are hidden from inbox)
  const visibleIssues = useMemo(() => {
    return issues.filter(i => !i.mergedInto);
  }, [issues]);

  const filteredAndSorted = useMemo(() => {
    let result = [...visibleIssues];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        i =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.location.block.toLowerCase().includes(q) ||
          i.location.floor.toLowerCase().includes(q) ||
          i.reportedBy.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(i => i.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(i => i.status === statusFilter);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.reportedAt).getTime() - new Date(b.reportedAt).getTime());
        break;
      case 'category':
        result.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case 'location':
        result.sort((a, b) => a.location.block.localeCompare(b.location.block));
        break;
    }

    return result;
  }, [visibleIssues, searchQuery, categoryFilter, statusFilter, sortBy]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredAndSorted.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSorted.map(i => i.id)));
    }
  };

  const openMergeModal = () => {
    if (selectedIds.size < 2) {
      setError('Select at least 2 issues to merge');
      return;
    }
    setParentId(null);
    setShowMergeModal(true);
  };

  const handleMerge = async () => {
    if (!parentId) {
      setError('Please select a parent issue');
      return;
    }

    const childIds = Array.from(selectedIds).filter(id => id !== parentId);
    if (childIds.length === 0) {
      setError('Need at least one child issue to merge');
      return;
    }

    setMergeLoading(true);
    setError(null);

    try {
      const result = await mergeIssuesApi(parentId, childIds);
      setSuccess(result.message);
      setSelectedIds(new Set());
      setShowMergeModal(false);
      setParentId(null);
      onIssuesMerged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to merge issues');
    } finally {
      setMergeLoading(false);
    }
  };

  const handleAddToPoll = () => {
    if (selectedIds.size === 0) {
      setError('Select issues to add to poll');
      return;
    }
    onNavigateToPoll(Array.from(selectedIds));
  };

  const formatDateTime = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTimeAgo = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${days}d ago`;
  };

  const categories: IssueCategory[] = [
    'Broken Furniture',
    'Water Problem',
    'Electrical Fault',
    'Washroom Hygiene',
    'Classroom Maintenance',
    'Other',
  ];

  const selectedIssues = useMemo(
    () => visibleIssues.filter(i => selectedIds.has(i.id)),
    [visibleIssues, selectedIds]
  );

  return (
    <div className="space-y-5">
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

      {/* Header with stats */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Issue Inbox</h2>
            <p className="text-sm text-white/60">All received issues with timestamps</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
            <p className="text-xl font-bold">{visibleIssues.length}</p>
            <p className="text-xs text-white/60">Total</p>
          </div>
          <div className="bg-yellow-500/20 rounded-xl p-3 text-center backdrop-blur-sm">
            <p className="text-xl font-bold">{visibleIssues.filter(i => i.status === 'pending').length}</p>
            <p className="text-xs text-white/60">Pending</p>
          </div>
          <div className="bg-blue-500/20 rounded-xl p-3 text-center backdrop-blur-sm">
            <p className="text-xl font-bold">{visibleIssues.filter(i => i.status === 'verified').length}</p>
            <p className="text-xs text-white/60">Verified</p>
          </div>
          <div className="bg-green-500/20 rounded-xl p-3 text-center backdrop-blur-sm">
            <p className="text-xl font-bold">{visibleIssues.filter(i => i.status === 'completed').length}</p>
            <p className="text-xs text-white/60">Completed</p>
          </div>
        </div>
      </div>

      {/* Search & Action Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search issues..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortBy)}
              className="appearance-none pl-8 pr-8 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="category">By Category</option>
              <option value="location">By Location</option>
            </select>
            <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              showFilters
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filters row */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500 self-center mr-1">Category:</span>
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    categoryFilter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      categoryFilter === cat
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {CATEGORY_ICONS[cat]} {cat}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-2 mt-2">
                <span className="text-xs text-gray-500 self-center mr-1">Status:</span>
                {['all', 'pending', 'verified', 'ongoing', 'completed'].map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      statusFilter === s
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selection Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-indigo-600 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3"
          >
            <div className="flex items-center gap-2 text-white">
              <Layers className="w-5 h-5" />
              <span className="text-sm font-medium">{selectedIds.size} issue(s) selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={openMergeModal}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <GitMerge className="w-4 h-4" />
                Merge Selected
              </button>
              <button
                onClick={handleAddToPoll}
                className="flex items-center gap-1.5 px-4 py-2 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl text-sm font-medium transition-colors"
              >
                <Tag className="w-4 h-4" />
                Add to Poll
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="flex items-center gap-1.5 px-3 py-2 text-white/70 hover:text-white transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Issues List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-500">
            Showing {filteredAndSorted.length} issue{filteredAndSorted.length !== 1 ? 's' : ''}
          </p>
          {filteredAndSorted.length > 0 && (
            <button
              onClick={selectAll}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {selectedIds.size === filteredAndSorted.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {filteredAndSorted.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-12 text-center">
            <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No issues found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAndSorted.map((issue, idx) => {
              const statusStyle = STATUS_COLORS[issue.status] || STATUS_COLORS.pending;

              return (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className={`bg-white rounded-xl border transition-all ${
                    selectedIds.has(issue.id)
                      ? 'border-indigo-300 ring-1 ring-indigo-200 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedIds.has(issue.id)}
                        onChange={() => toggleSelect(issue.id)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 mt-0.5"
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {CATEGORY_ICONS[issue.category] || '📋'} {issue.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {issue.description}
                            </p>
                          </div>

                          {/* Status badge */}
                          <span
                            className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                          >
                            {issue.status}
                          </span>
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {formatDateTime(issue.reportedAt)}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(issue.reportedAt)}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {issue.location.block}, {issue.location.floor}
                            {issue.location.room && issue.location.room !== 'N/A'
                              ? `, ${issue.location.room}`
                              : ''}
                          </span>
                          <span className="text-xs text-gray-400">
                            by {issue.reportedBy}
                          </span>
                        </div>

                        {/* Merged children badge */}
                        {(issue.mergedChildren?.length || 0) > 0 && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <GitMerge className="w-3.5 h-3.5 text-purple-500" />
                            <span className="text-xs text-purple-700 font-medium">
                              {issue.mergedChildren!.length} issue(s) merged into this
                            </span>
                          </div>
                        )}
                      </div>

                      {/* View button */}
                      <button
                        onClick={() => setViewingIssue(issue)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                      >
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Merge Modal */}
      <AnimatePresence>
        {showMergeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={e => e.target === e.currentTarget && setShowMergeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitMerge className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-bold text-gray-900">Merge Issues</h2>
                </div>
                <button
                  onClick={() => setShowMergeModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-600">
                  Select one issue as the <strong>parent</strong>. The other {selectedIds.size - 1} issue(s) will be merged into it.
                </p>

                <div className="space-y-2">
                  {selectedIssues.map(issue => (
                    <label
                      key={issue.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        parentId === issue.id
                          ? 'bg-purple-50 border-purple-300 ring-1 ring-purple-200'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="parentIssue"
                        checked={parentId === issue.id}
                        onChange={() => setParentId(issue.id)}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{issue.title}</p>
                        <p className="text-xs text-gray-500 capitalize">
                          {issue.category} • {issue.location.block}
                        </p>
                      </div>
                      {parentId === issue.id && (
                        <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full font-medium">
                          Parent
                        </span>
                      )}
                    </label>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowMergeModal(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMerge}
                    disabled={!parentId || mergeLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {mergeLoading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <GitMerge className="w-4 h-4" />
                    )}
                    Merge {selectedIds.size - 1} Issue(s)
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Issue Detail Modal */}
      <AnimatePresence>
        {viewingIssue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={e => e.target === e.currentTarget && setViewingIssue(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Issue Details</h2>
                <button
                  onClick={() => setViewingIssue(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 text-sm mb-1">Title</h3>
                  <p className="text-gray-900">{viewingIssue.title}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 text-sm mb-1">Description</h3>
                  <p className="text-gray-900 text-sm">{viewingIssue.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 text-sm mb-1">Category</h3>
                    <p className="text-gray-900 text-sm">{viewingIssue.category}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 text-sm mb-1">Status</h3>
                    <p className="text-gray-900 text-sm capitalize">{viewingIssue.status}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 text-sm mb-1">Location</h3>
                  <p className="text-gray-900 text-sm">
                    {viewingIssue.location.block}, {viewingIssue.location.floor}
                    {viewingIssue.location.room && viewingIssue.location.room !== 'N/A' ? `, ${viewingIssue.location.room}` : ''}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 text-sm mb-1">Reported By</h3>
                    <p className="text-gray-900 text-sm">{viewingIssue.reportedBy}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 text-sm mb-1">Reported At</h3>
                    <p className="text-gray-900 text-sm">{formatDateTime(viewingIssue.reportedAt)}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 text-sm mb-1">Votes</h3>
                  <p className="text-gray-900 text-sm">{viewingIssue.votes} votes</p>
                </div>
                {viewingIssue.images && viewingIssue.images.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-700 text-sm mb-2">Images</h3>
                    <div className="flex gap-2 flex-wrap">
                      {viewingIssue.images.map((img, i) => (
                        <img
                          key={i}
                          src={img.startsWith('http') ? img : `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '')}${img}`}
                          alt={`Issue ${i + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
