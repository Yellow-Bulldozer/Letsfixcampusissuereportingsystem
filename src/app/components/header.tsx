import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { UserRole } from '../types';
import { GraduationCap, LogOut, Shield, UserCog, UserCircle } from 'lucide-react';
import { easeOutExpo } from '../lib/animations';

interface HeaderProps {
  userName: string;
  userRole: UserRole;
  onLogout: () => void;
  onProfile: () => void;
}

export function Header({ userName, userRole, onLogout, onProfile }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const getRoleLabel = () => {
    switch (userRole) {
      case 'student': return 'Student';
      case 'admin': return 'Admin';
      case 'authority': return 'Administration';
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'student': return <GraduationCap className="w-4 h-4" />;
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'authority': return <UserCog className="w-4 h-4" />;
    }
  };

  const getRoleBadgeColor = () => {
    switch (userRole) {
      case 'student': return 'bg-blue-100 text-blue-700';
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'authority': return 'bg-green-100 text-green-700';
    }
  };

  return (
    <motion.header
      className="sticky top-0 z-50"
      style={{
        background: scrolled ? 'rgba(255,255,255,0.95)' : '#ffffff',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.08)' : '0 1px 0 rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.3s ease, backdrop-filter 0.3s ease'
      }}
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOutExpo }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="bg-[#1A1A2E] p-2 rounded-xl">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 font-archivo">Let'sFix</h1>
              <p className="text-xs text-gray-400">Transparent Issue Resolution</p>
            </div>
          </div>

          {/* Right side: Name → Profile → Logout */}
          <div className="flex items-center gap-2">
            {/* Name + Role badge */}
            <motion.div
              className="text-right hidden sm:block mr-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.15, ease: easeOutExpo }}
            >
              <p className="font-medium text-gray-900 text-sm">{userName}</p>
              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor()}`}>
                {getRoleIcon()}
                <span>{getRoleLabel()}</span>
              </div>
            </motion.div>

            {/* Profile button */}
            <motion.button
              onClick={onProfile}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18 }}
              title="View Profile"
            >
              <UserCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </motion.button>

            {/* Divider */}
            <div className="h-5 w-px bg-gray-200 hidden sm:block" />

            {/* Logout button */}
            <motion.button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.22 }}
            >
              <motion.span whileHover={{ rotate: 15 }} transition={{ type: 'spring', stiffness: 300 }}>
                <LogOut className="w-4 h-4" />
              </motion.span>
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
