import { motion } from 'motion/react';
import { Issue, User } from '../types';
import { Bell, ClipboardList, Flame, Megaphone, Sparkles, Vote } from 'lucide-react';
import { staggerContainer, fadeUp, fadeScale, pageVariants, easeOutExpo } from '../lib/animations';

interface PostLoginContentProps {
  user: User;
  issues: Issue[];
  onReportIssue: () => void;
  onViewVoteIssues: () => void;
  onTrackMyIssues: () => void;
  onContinue: () => void;
}

const statusColor: Record<Issue['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  verified: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700'
};

const ACTION_CARDS = [
  {
    key: 'report',
    Icon: Megaphone,
    title: 'Report Issue',
    desc: 'Submit a campus problem with details and location.',
    iconColor: 'text-blue-600',
    bg: 'bg-blue-500',
    isBlue: true
  },
  {
    key: 'vote',
    Icon: Vote,
    title: 'View / Vote Issues',
    desc: 'Prioritize what matters most this week.',
    iconColor: 'text-indigo-600',
    bg: '',
    isBlue: false
  },
  {
    key: 'track',
    Icon: ClipboardList,
    title: 'Track My Issues',
    desc: 'Check status updates and response timelines.',
    iconColor: 'text-emerald-600',
    bg: '',
    isBlue: false
  },
  {
    key: 'notify',
    Icon: Bell,
    title: 'Notifications',
    desc: 'Get alerts when issue status changes.',
    iconColor: 'text-amber-600',
    bg: '',
    isBlue: false
  }
];

export function PostLoginContent({
  user,
  issues,
  onReportIssue,
  onViewVoteIssues,
  onTrackMyIssues,
  onContinue
}: PostLoginContentProps) {
  const trendingIssues = [...issues]
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 5);

  const handlers: Record<string, (() => void) | undefined> = {
    report: onReportIssue,
    vote: onViewVoteIssues,
    track: onTrackMyIssues,
    notify: undefined
  };

  return (
    <motion.div
      className="space-y-6"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Welcome banner ── */}
      <motion.section
        className="rounded-3xl border border-white/40 bg-white/70 p-7 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl"
        variants={fadeScale}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              <Sparkles className="h-4 w-4" />
              Welcome to Let'sFix
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 font-archivo">
              Hi {user.name.split(' ')[0]}, ready to improve campus life?
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Report critical issues, vote on priorities, and track resolution updates from one collaborative workspace.
            </p>
          </div>
          <motion.button
            onClick={onContinue}
            className="shrink-0 rounded-xl bg-[#1A1A2E] px-6 py-3 text-sm font-semibold text-white"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            Go To Workspace
          </motion.button>
        </div>
      </motion.section>

      {/* ── Action cards — staggered ── */}
      <motion.section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainer(0.09, 0.15)}
        initial="hidden"
        animate="visible"
      >
        {ACTION_CARDS.map(({ key, Icon, title, desc, iconColor, bg, isBlue }) => {
          const handler = handlers[key];
          const base = isBlue
            ? 'rounded-2xl p-5 text-left text-white shadow-lg cursor-pointer'
            : 'rounded-2xl p-5 text-left border border-white/50 bg-white/60 shadow-md backdrop-blur-xl cursor-pointer';

          return (
            <motion.div
              key={key}
              className={base}
              style={isBlue ? { background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' } : {}}
              variants={fadeUp}
              whileHover={{ y: -6, transition: { type: 'spring', stiffness: 380, damping: 24 } }}
              whileTap={{ scale: 0.97 }}
              onClick={handler}
            >
              <Icon className={`mb-3 h-6 w-6 ${isBlue ? 'text-white' : iconColor}`} />
              <h3 className={`text-base font-semibold ${isBlue ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
              <p className={`mt-1 text-sm ${isBlue ? 'text-blue-100' : 'text-slate-600'}`}>{desc}</p>
              {key === 'notify' && (
                <p className="mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  Live updates enabled
                </p>
              )}
            </motion.div>
          );
        })}
      </motion.section>

      {/* ── Trending issues ── */}
      <motion.section
        className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-[0_8px_28px_rgba(15,23,42,0.07)] backdrop-blur-xl"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.5 }}
      >
        <div className="mb-4 flex items-center gap-2">
          <Flame className="h-5 w-5 text-rose-500" />
          <h3 className="text-xl font-bold text-slate-900 font-archivo">Trending Issues</h3>
        </div>

        <motion.div
          className="space-y-3"
          variants={staggerContainer(0.07, 0.55)}
          initial="hidden"
          animate="visible"
        >
          {trendingIssues.length > 0 ? trendingIssues.map((issue) => (
            <motion.div
              key={issue.id}
              className="issue-row"
              variants={fadeUp}
              whileHover={{ y: -2, transition: { type: 'spring', stiffness: 400, damping: 26 } }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900 text-sm">{issue.title}</p>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {issue.votes} votes
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColor[issue.status]}`}>
                    {issue.status}
                  </span>
                </div>
              </div>
              <p className="mt-1 text-xs text-slate-500">{issue.location.block} | {issue.location.room}</p>
            </motion.div>
          )) : (
            <p className="text-sm text-slate-400 text-center py-4">No issues yet — be the first to report!</p>
          )}
        </motion.div>
      </motion.section>
    </motion.div>
  );
}
