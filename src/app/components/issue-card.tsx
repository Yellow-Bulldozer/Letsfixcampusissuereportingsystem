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

interface IssueCardProps {
  issue: Issue;
  showVotes?: boolean;
  onClick?: () => void;
}

export function IssueCard({ issue, showVotes = false, onClick }: IssueCardProps) {
  const getStatusConfig = (status: Issue['status']) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          icon: Clock
        };
      case 'verified':
        return {
          label: 'Verified',
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: CheckCircle2
        };
      case 'ongoing':
        return {
          label: 'Ongoing',
          color: 'bg-orange-100 text-orange-700 border-orange-200',
          icon: AlertCircle
        };
      case 'completed':
        return {
          label: 'Completed',
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: CheckCircle2
        };
    }
  };

  const getCategoryIcon = (category: Issue['category']) => {
    switch (category) {
      case 'Broken Furniture':
        return Armchair;
      case 'Water Problem':
        return Droplet;
      case 'Electrical Fault':
        return Zap;
      case 'Washroom Hygiene':
        return Bath;
      case 'Classroom Maintenance':
        return Wrench;
      default:
        return AlertTriangle;
    }
  };

  const statusConfig = getStatusConfig(issue.status);
  const StatusIcon = statusConfig.icon;
  const CategoryIcon = getCategoryIcon(issue.category);

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="bg-blue-50 p-2.5 rounded-lg">
            <CategoryIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{issue.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{issue.description}</p>
          </div>
        </div>
        
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${statusConfig.color} text-xs font-medium whitespace-nowrap`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {statusConfig.label}
        </div>
      </div>

      {/* Category & Location */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
          {issue.category}
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
          <MapPin className="w-3 h-3" />
          {issue.location.block}, {issue.location.floor}, {issue.location.room}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4 text-xs text-gray-500">
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
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg">
            <ThumbsUp className="w-4 h-4" />
            <span className="font-semibold">{issue.votes}</span>
            <span className="text-xs">votes</span>
          </div>
        )}
      </div>
    </div>
  );
}
