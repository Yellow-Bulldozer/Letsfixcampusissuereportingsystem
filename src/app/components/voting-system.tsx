import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Issue } from '../types';
import { IssueCard } from './issue-card';
import { ThumbsUp, Trophy, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { getCurrentDay, isSaturday } from '../utils/date-utils';
import { pageVariants, staggerContainer, fadeUp, fadeScale, easeOutExpo } from '../lib/animations';

interface VotingSystemProps {
  issues: Issue[];
  userVotedIssueId: string | null;
  onVote: (issueId: string) => void;
  hasActivePoll?: boolean;
}

export function VotingSystem({ issues, userVotedIssueId, onVote, hasActivePoll = false }: VotingSystemProps) {
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(userVotedIssueId);
  const [hasJustVoted, setHasJustVoted] = useState(false);
  const currentDay = getCurrentDay();
  const isVotingDay = isSaturday() || hasActivePoll;

  const verifiedIssues = useMemo(() => {
    return issues
      .filter(issue => issue.status === 'verified')
      .sort((a, b) => b.votes - a.votes);
  }, [issues]);

  const topIssue = verifiedIssues[0];
  const hasVoted = userVotedIssueId !== null;

  const handleVote = () => {
    if (selectedIssueId && !hasVoted) {
      setHasJustVoted(true);
      onVote(selectedIssueId);
    }
  };

  if (!isVotingDay) {
    return (
      <motion.div
        className="space-y-6"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Info Banner */}
        <motion.div
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6"
          variants={fadeScale}
        >
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2 font-archivo">Voting Opens on Saturday</h3>
              <p className="text-blue-700 text-sm">
                Today is <span className="font-semibold">{currentDay}</span>. The weekly poll will be available on Saturday for 24 hours.
                You'll be able to vote for the most critical issue that needs immediate attention.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Preview of Issues */}
        {verifiedIssues.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}>
            <h2 className="text-lg font-bold text-gray-900 mb-4 font-archivo">Issues Eligible for Voting</h2>
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-5"
              variants={staggerContainer(0.08, 0.2)}
              initial="hidden"
              animate="visible"
            >
              {verifiedIssues.slice(0, 4).map(issue => (
                <motion.div key={issue.id} variants={fadeUp}>
                  <IssueCard issue={issue} showVotes />
                </motion.div>
              ))}
            </motion.div>
            {verifiedIssues.length > 4 && (
              <p className="text-center text-gray-400 text-sm mt-4">
                +{verifiedIssues.length - 4} more issues
              </p>
            )}
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Voting Header */}
      <motion.div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: hasActivePoll && !isSaturday()
          ? 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)'
          : 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)' }}
        variants={fadeScale}
        initial="hidden"
        animate="visible"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="flex items-center gap-3 mb-3 relative">
          <div className="bg-white/20 p-2.5 rounded-xl">
            <Trophy className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-archivo">
            {hasActivePoll && !isSaturday() ? 'Admin Poll — Active Now' : 'Weekly Priority Vote'}
          </h2>
          <span className="ml-auto inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            Live
          </span>
        </div>
        <p className="text-blue-100 text-sm relative">
          {hasActivePoll && !isSaturday()
            ? 'An admin has started a special poll. Vote for the issue you believe needs the most urgent attention.'
            : 'Vote for the issue you believe needs the most urgent attention. Poll closes in 24 hours.'}
        </p>
      </motion.div>

      {/* Current Leader */}
      {topIssue && (
        <motion.div
          className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-amber-900 font-archivo">Current Top Priority</h3>
          </div>
          <IssueCard issue={topIssue} showVotes />
        </motion.div>
      )}

      {/* Voting Status */}
      <AnimatePresence mode="wait">
        {hasVoted ? (
          <motion.div
            key="voted"
            className="bg-green-50 border border-green-200 rounded-2xl p-5"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="bg-green-100 p-3 rounded-xl"
                initial={hasJustVoted ? { scale: 0 } : { scale: 1 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.1 }}
              >
                <CheckCircle className="w-6 h-6 text-green-600" />
              </motion.div>
              <div>
                <h3 className="font-semibold text-green-900 mb-1 font-archivo">Vote Submitted!</h3>
                <p className="text-green-700 text-sm">
                  Thank you for participating. Check back after the poll closes to see the results.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="not-voted"
            className="bg-white border-2 border-indigo-100 rounded-2xl p-5"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <h3 className="font-semibold text-gray-900 mb-3 font-archivo">Cast Your Vote</h3>
            <p className="text-gray-500 text-sm mb-3">
              Select the issue you think should be prioritized this week, then click "Submit Vote" below.
            </p>
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>You can only vote once. Choose carefully!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Issues List */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.25 }}>
        <h3 className="text-base font-semibold text-gray-900 mb-4 font-archivo">
          All Verified Issues ({verifiedIssues.length})
        </h3>

        {verifiedIssues.length > 0 ? (
          <motion.div
            className="space-y-4"
            variants={staggerContainer(0.07, 0.3)}
            initial="hidden"
            animate="visible"
          >
            {verifiedIssues.map(issue => (
              <motion.div
                key={issue.id}
                variants={fadeUp}
                onClick={() => !hasVoted && setSelectedIssueId(issue.id)}
                className={`relative ${!hasVoted ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                whileHover={!hasVoted ? { scale: 1.01, transition: { type: 'spring', stiffness: 400, damping: 26 } } : {}}
              >
                {!hasVoted && (
                  <div className="absolute left-5 top-5 z-10">
                    <motion.div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedIssueId === issue.id
                          ? 'border-indigo-600 bg-indigo-600'
                          : 'border-gray-300 bg-white'
                      }`}
                      animate={{ scale: selectedIssueId === issue.id ? [1, 1.3, 1] : 1 }}
                      transition={{ duration: 0.25 }}
                    >
                      {selectedIssueId === issue.id && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </motion.div>
                  </div>
                )}
                <div className={!hasVoted ? 'ml-10' : ''}>
                  <IssueCard issue={issue} showVotes />
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-gray-400 text-sm">No verified issues available for voting yet.</p>
          </motion.div>
        )}
      </motion.div>

      {/* Sticky Vote Button */}
      <AnimatePresence>
        {!hasVoted && verifiedIssues.length > 0 && (
          <motion.div
            className="sticky bottom-0 bg-white/90 backdrop-blur-md border-t border-gray-100 p-4 -mx-4 sm:-mx-6 lg:-mx-8"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.35, ease: easeOutExpo }}
          >
            <div className="max-w-7xl mx-auto">
              <motion.button
                onClick={handleVote}
                disabled={!selectedIssueId}
                className="w-full sm:w-auto px-8 py-4 bg-[#1A1A2E] hover:bg-[#2d2d44] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm transition-colors"
                whileHover={selectedIssueId ? { scale: 1.03 } : {}}
                whileTap={selectedIssueId ? { scale: 0.93 } : {}}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <ThumbsUp className="w-4 h-4" />
                {selectedIssueId ? 'Submit Vote' : 'Select an Issue First'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
