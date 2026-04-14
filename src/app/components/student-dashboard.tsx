import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Issue, IssueStatus, IssueCategory } from '../types';
import { IssueCard } from './issue-card';
import { Plus, Filter, Search } from 'lucide-react';
import { staggerContainer, fadeUp, pageVariants, easeOutExpo } from '../lib/animations';

interface StudentDashboardProps {
  issues: Issue[];
  onReportIssue: () => void;
}

const STAT_COLORS = [
  { label: 'Total Issues', key: 'total', color: '#6366f1', light: 'rgba(99,102,241,0.08)' },
  { label: 'Pending', key: 'pending', color: '#f59e0b', light: 'rgba(245,158,11,0.08)' },
  { label: 'Ongoing', key: 'ongoing', color: '#f97316', light: 'rgba(249,115,22,0.08)' },
  { label: 'Completed', key: 'completed', color: '#10b981', light: 'rgba(16,185,129,0.08)' }
];

export function StudentDashboard({ issues, onReportIssue }: StudentDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | 'all'>('all');

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchesSearch =
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.location.block.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [issues, searchQuery, statusFilter, categoryFilter]);

  const stats = useMemo(() => ({
    total: issues.length,
    pending: issues.filter(i => i.status === 'pending').length,
    ongoing: issues.filter(i => i.status === 'ongoing').length,
    completed: issues.filter(i => i.status === 'completed').length
  }), [issues]);

  const categories: (IssueCategory | 'all')[] = [
    'all', 'Broken Furniture', 'Water Problem', 'Electrical Fault',
    'Washroom Hygiene', 'Classroom Maintenance', 'Other'
  ];
  const statuses: (IssueStatus | 'all')[] = ['all', 'pending', 'verified', 'ongoing', 'completed'];

  return (
    <motion.div
      className="space-y-6"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Stats Overview */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={staggerContainer(0.08, 0.0)}
        initial="hidden"
        animate="visible"
      >
        {STAT_COLORS.map(({ label, key, color, light }) => (
          <motion.div
            key={key}
            className="stat-card"
            variants={fadeUp}
            whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 26 } }}
            style={{ borderTop: `3px solid ${color}`, background: light }}
          >
            <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{label}</p>
            <motion.p
              className="text-3xl font-black"
              style={{ color }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 20 }}
            >
              {stats[key as keyof typeof stats]}
            </motion.p>
          </motion.div>
        ))}
      </motion.div>

      {/* Actions & Filters */}
      <motion.div
        className="bg-white rounded-2xl border border-gray-100 p-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25, ease: easeOutExpo }}
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent text-sm transition-all"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as IssueStatus | 'all')}
                className="px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent text-sm"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as IssueCategory | 'all')}
              className="px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>

            <motion.button
              onClick={onReportIssue}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A2E] hover:bg-[#2d2d44] text-white font-medium rounded-xl transition-colors text-sm"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
              Report Issue
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Issues Grid */}
      {filteredIssues.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
          variants={staggerContainer(0.07, 0.3)}
          initial="hidden"
          animate="visible"
        >
          {filteredIssues.map(issue => (
            <motion.div key={issue.id} variants={fadeUp}>
              <IssueCard issue={issue} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="bg-white rounded-2xl border border-dashed border-gray-200 p-14 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-gray-400 text-sm">No issues found matching your filters.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
