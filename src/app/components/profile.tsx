import { useMemo } from 'react';
import { Issue, User, Vote } from '../types';
import {
  GraduationCap,
  Shield,
  UserCog,
  Mail,
  BadgeCheck,
  ClipboardList,
  Vote as VoteIcon,
  AlertTriangle,
  Clock,
  CheckCircle
} from 'lucide-react';

interface ProfileProps {
  user: User;
  issues: Issue[];
  votes: Vote[];
}

const getRoleIcon = (role: User['role']) => {
  switch (role) {
    case 'student':
      return <GraduationCap className="w-5 h-5" />;
    case 'admin':
      return <Shield className="w-5 h-5" />;
    case 'authority':
      return <UserCog className="w-5 h-5" />;
  }
};

const getRoleBadgeColor = (role: User['role']) => {
  switch (role) {
    case 'student':
      return 'bg-blue-100 text-blue-700';
    case 'admin':
      return 'bg-purple-100 text-purple-700';
    case 'authority':
      return 'bg-green-100 text-green-700';
  }
};

const getRoleLabel = (role: User['role']) => {
  switch (role) {
    case 'student':
      return 'Student';
    case 'admin':
      return 'Admin';
    case 'authority':
      return 'Administration';
  }
};

export function Profile({ user, issues, votes }: ProfileProps) {
  const userIssues = useMemo(() => {
    return issues.filter(issue => issue.reportedBy === user.name);
  }, [issues, user.name]);

  const issueStats = useMemo(() => {
    return {
      total: issues.length,
      pending: issues.filter(i => i.status === 'pending').length,
      verified: issues.filter(i => i.status === 'verified').length,
      ongoing: issues.filter(i => i.status === 'ongoing').length,
      completed: issues.filter(i => i.status === 'completed').length
    };
  }, [issues]);

  const studentStats = useMemo(() => {
    return {
      total: userIssues.length,
      pending: userIssues.filter(i => i.status === 'pending').length,
      ongoing: userIssues.filter(i => i.status === 'ongoing').length,
      completed: userIssues.filter(i => i.status === 'completed').length,
      votes: votes.filter(v => v.userId === user.id).length
    };
  }, [userIssues, votes, user.id]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
              {user.name.split(' ').map(part => part[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                {getRoleIcon(user.role)}
                <span>{getRoleLabel(user.role)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-gray-500" />
              <span>{user.collegeId}</span>
            </div>
          </div>
        </div>
      </div>

      {user.role === 'student' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <ClipboardList className="w-5 h-5 text-gray-600" />
              <p className="text-sm text-gray-600">My Issues</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{studentStats.total}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-700">Pending</p>
            </div>
            <p className="text-3xl font-bold text-yellow-700">{studentStats.pending}</p>
          </div>
          <div className="bg-orange-50 rounded-xl border border-orange-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-orange-700">Ongoing</p>
            </div>
            <p className="text-3xl font-bold text-orange-700">{studentStats.ongoing}</p>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-700">Completed</p>
            </div>
            <p className="text-3xl font-bold text-green-700">{studentStats.completed}</p>
          </div>
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <VoteIcon className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-700">Votes Cast</p>
            </div>
            <p className="text-3xl font-bold text-blue-700">{studentStats.votes}</p>
          </div>
        </div>
      )}

      {user.role === 'admin' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <ClipboardList className="w-5 h-5 text-gray-600" />
              <p className="text-sm text-gray-600">Total Issues</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{issueStats.total}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-700">Pending</p>
            </div>
            <p className="text-3xl font-bold text-yellow-700">{issueStats.pending}</p>
          </div>
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-700">Verified</p>
            </div>
            <p className="text-3xl font-bold text-blue-700">{issueStats.verified}</p>
          </div>
          <div className="bg-orange-50 rounded-xl border border-orange-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-orange-700">Ongoing</p>
            </div>
            <p className="text-3xl font-bold text-orange-700">{issueStats.ongoing}</p>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-700">Completed</p>
            </div>
            <p className="text-3xl font-bold text-green-700">{issueStats.completed}</p>
          </div>
        </div>
      )}

      {user.role === 'authority' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <ClipboardList className="w-5 h-5 text-gray-600" />
              <p className="text-sm text-gray-600">Active Issues</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{issueStats.verified + issueStats.ongoing}</p>
          </div>
          <div className="bg-orange-50 rounded-xl border border-orange-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-orange-700">Ongoing</p>
            </div>
            <p className="text-3xl font-bold text-orange-700">{issueStats.ongoing}</p>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-700">Completed</p>
            </div>
            <p className="text-3xl font-bold text-green-700">{issueStats.completed}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-700">Pending</p>
            </div>
            <p className="text-3xl font-bold text-yellow-700">{issueStats.pending}</p>
          </div>
        </div>
      )}
    </div>
  );
}
