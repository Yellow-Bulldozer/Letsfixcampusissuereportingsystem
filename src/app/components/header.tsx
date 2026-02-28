import { UserRole } from '../types';
import { GraduationCap, LogOut, Shield, UserCog } from 'lucide-react';

interface HeaderProps {
  userName: string;
  userRole: UserRole;
  onLogout: () => void;
}

export function Header({ userName, userRole, onLogout }: HeaderProps) {
  const getRoleLabel = () => {
    switch (userRole) {
      case 'student':
        return 'Student';
      case 'admin':
        return 'Admin';
      case 'authority':
        return 'Administration';
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'student':
        return <GraduationCap className="w-5 h-5" />;
      case 'admin':
        return <Shield className="w-5 h-5" />;
      case 'authority':
        return <UserCog className="w-5 h-5" />;
    }
  };

  const getRoleBadgeColor = () => {
    switch (userRole) {
      case 'student':
        return 'bg-blue-100 text-blue-700';
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'authority':
        return 'bg-green-100 text-green-700';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Let'sFix</h1>
              <p className="text-xs text-gray-500">Transparent Issue Resolution</p>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-medium text-gray-900">{userName}</p>
              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor()}`}>
                {getRoleIcon()}
                <span>{getRoleLabel()}</span>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
