import { Issue, User } from '../types';
import { Bell, ClipboardList, Flame, Megaphone, Sparkles, Vote } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/40 bg-white/45 p-7 shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              <Sparkles className="h-4 w-4" />
              Welcome to Let'sFix
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">Hi {user.name.split(' ')[0]}, ready to improve campus life?</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-700">
              Report critical issues, vote on priorities, and track resolution updates from one collaborative workspace.
            </p>
          </div>
          <button
            onClick={onContinue}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Go To Workspace
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <button
          onClick={onReportIssue}
          className="rounded-2xl border border-blue-200/70 bg-blue-500/85 p-5 text-left text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
        >
          <Megaphone className="mb-3 h-6 w-6" />
          <h3 className="text-lg font-semibold">Report Issue</h3>
          <p className="mt-1 text-sm text-blue-50">Submit a campus problem with details and location.</p>
        </button>

        <button
          onClick={onViewVoteIssues}
          className="rounded-2xl border border-white/50 bg-white/45 p-5 text-left shadow-md backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl"
        >
          <Vote className="mb-3 h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-900">View / Vote Issues</h3>
          <p className="mt-1 text-sm text-slate-600">Prioritize what matters most this week.</p>
        </button>

        <button
          onClick={onTrackMyIssues}
          className="rounded-2xl border border-white/50 bg-white/45 p-5 text-left shadow-md backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl"
        >
          <ClipboardList className="mb-3 h-6 w-6 text-emerald-600" />
          <h3 className="text-lg font-semibold text-slate-900">Track My Issues</h3>
          <p className="mt-1 text-sm text-slate-600">Check status updates and response timelines.</p>
        </button>

        <div className="rounded-2xl border border-white/50 bg-white/45 p-5 shadow-md backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl">
          <Bell className="mb-3 h-6 w-6 text-amber-600" />
          <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
          <p className="mt-1 text-sm text-slate-600">Get alerts when issue status changes.</p>
          <p className="mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Live updates enabled</p>
        </div>
      </section>

      <section className="rounded-3xl border border-white/40 bg-white/45 p-6 shadow-[0_12px_32px_rgba(15,23,42,0.1)] backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2">
          <Flame className="h-5 w-5 text-rose-600" />
          <h3 className="text-xl font-bold text-slate-900">Trending Issues</h3>
        </div>

        <div className="space-y-3">
          {trendingIssues.map((issue) => (
            <div
              key={issue.id}
              className="rounded-xl border border-white/60 bg-white/55 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{issue.title}</p>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {issue.votes} votes
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColor[issue.status]}`}>
                    {issue.status}
                  </span>
                </div>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {issue.location.block} | {issue.location.room}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
