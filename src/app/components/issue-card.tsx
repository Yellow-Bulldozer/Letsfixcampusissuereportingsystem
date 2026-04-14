import { motion } from 'motion/react';
import { Issue } from '../types';
import {
  MapPin,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  ThumbsUp,
  Armchair,
  Droplet,
  Zap,
  Bath,
  Wrench,
  AlertTriangle
} from 'lucide-react';
import { formatDate } from '../utils/date-utils';
import { softSpring } from '../lib/animations';

interface IssueCardProps {
  issue: Issue;
  showVotes?: boolean;
  onClick?: () => void;
}

export function IssueCard({ issue, showVotes = false, onClick }: IssueCardProps) {
  const getStatusConfig = (status: Issue['status']) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock };
      case 'verified':
        return { label: 'Verified', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2 };
      case 'ongoing':
        return { label: 'Ongoing', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertCircle };
      case 'completed':
        return { label: 'Completed', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 };
    }
  };

  const getCategoryIcon = (category: Issue['category']) => {
    switch (category) {
      case 'Broken Furniture': return Armchair;
      case 'Water Problem': return Droplet;
      case 'Electrical Fault': return Zap;
      case 'Washroom Hygiene': return Bath;
      case 'Classroom Maintenance': return Wrench;
      default: return AlertTriangle;
    }
  };

  const statusConfig = getStatusConfig(issue.status);
  const StatusIcon = statusConfig.icon;
  const CategoryIcon = getCategoryIcon(issue.category);

  return (
    <motion.div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 p-6 transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, transition: { type: 'spring' as const, stiffness: 400, damping: 30 } }}
      whileTap={onClick ? { scale: 0.99 } : {}}
      layout

    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="bg-blue-50 p-2.5 rounded-xl">
            <CategoryIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{issue.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">{issue.description}</p>
          </div>
        </div>

        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${statusConfig.color} text-xs font-medium whitespace-nowrap`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {statusConfig.label}
        </div>
      </div>

      {/* Category & Location */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium border border-gray-100">
          {issue.category}
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs border border-gray-100">
          <MapPin className="w-3 h-3" />
          {issue.location.block}, {issue.location.floor}, {issue.location.room}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {issue.reportedBy}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(issue.reportedAt)}
          </div>
        </div>

        {showVotes && (
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 22 }}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span className="font-bold text-sm">{issue.votes}</span>
            <span className="text-xs opacity-70">votes</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
