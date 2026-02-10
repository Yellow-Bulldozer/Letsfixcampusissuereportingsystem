import { Calendar, CheckCircle, Vote, AlertCircle } from 'lucide-react';
import { getCurrentDay, isSaturday, isWeekday } from '../utils/date-utils';

export function DayBanner() {
  const currentDay = getCurrentDay();
  const isVotingDay = isSaturday();
  const isReportingDay = isWeekday();

  if (isVotingDay) {
    return (
      <div className="mb-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-white/20 p-3 rounded-lg">
            <Vote className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">It's Voting Saturday! 🗳️</h3>
            <p className="text-blue-50">
              The weekly poll is now open. Cast your vote for the issue you think needs the most urgent attention. 
              Voting closes in 24 hours!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isReportingDay) {
    return (
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Report Issues Today</h3>
            <p className="text-sm text-blue-700">
              It's {currentDay} - you can report campus issues. The weekly voting will open on Saturday.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">It's {currentDay}</h3>
          <p className="text-sm text-gray-700">
            Issue reporting resumes on Monday. Check back then to report campus problems.
          </p>
        </div>
      </div>
    </div>
  );
}
