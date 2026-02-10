import { useState } from 'react';
import { UserRole } from '../types';
import { GraduationCap, Shield, UserCog } from 'lucide-react';

interface LoginProps {
  onLogin: (userId: string, role: UserRole) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  const roles = [
    {
      type: 'student' as UserRole,
      title: 'Student',
      icon: GraduationCap,
      description: 'Report issues and vote on priorities',
      color: 'bg-blue-500',
      userId: 'student1'
    },
    {
      type: 'admin' as UserRole,
      title: 'Administrator',
      icon: Shield,
      description: 'Verify and manage reported issues',
      color: 'bg-purple-500',
      userId: 'admin1'
    },
    {
      type: 'authority' as UserRole,
      title: 'College Authority',
      icon: UserCog,
      description: 'Track and resolve priority issues',
      color: 'bg-green-500',
      userId: 'authority1'
    }
  ];

  const handleLogin = () => {
    const role = roles.find(r => r.type === selectedRole);
    if (role) {
      onLogin(role.userId, role.type);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-4 rounded-2xl">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Campus Issue Reporter</h1>
          <p className="text-gray-600 text-lg">Empowering students to create positive change</p>
        </div>

        {/* Role Selection */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select Your Role</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.type;
              
              return (
                <button
                  key={role.type}
                  onClick={() => setSelectedRole(role.type)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className={`${role.color} w-14 h-14 rounded-lg flex items-center justify-center mb-4 mx-auto`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{role.title}</h3>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
          >
            Continue as {roles.find(r => r.type === selectedRole)?.title}
          </button>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-3">How it works:</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li className="flex items-start gap-2">
              <span className="font-semibold min-w-fit">Mon-Fri:</span>
              <span>Students report campus issues with details and images</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold min-w-fit">Saturday:</span>
              <span>Vote on the most critical issue that needs immediate attention</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold min-w-fit">Admins:</span>
              <span>Verify reports and manage the weekly voting process</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold min-w-fit">Authorities:</span>
              <span>Track and resolve priority issues transparently</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
