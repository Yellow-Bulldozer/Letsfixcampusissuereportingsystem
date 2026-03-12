import { FormEvent, useMemo, useState } from 'react';
import { UserRole } from '../types';
import { ArrowLeft, Eye, EyeOff, GraduationCap, Shield, UserCog, ArrowRight, CheckCircle } from 'lucide-react';

/* ── Campus-themed cards for the radial background ── */
const CAMPUS_CARDS = [
  { emoji: '🪑', label: 'Broken Furniture', color: 'card-peach' },
  { emoji: '💧', label: 'Water Leak', color: 'card-blue' },
  { emoji: '💡', label: 'Light Outage', color: 'card-cream' },
  { emoji: '🚧', label: 'Road Damage', color: 'card-rose' },
  { emoji: '🧹', label: 'Cleanliness', color: 'card-mint' },
  { emoji: '🔌', label: 'Power Issue', color: 'card-lavender' },
  { emoji: '🚰', label: 'Plumbing', color: 'card-sky' },
  { emoji: '🏗️', label: 'Construction', color: 'card-peach' },
  { emoji: '📶', label: 'WiFi Down', color: 'card-blue' },
  { emoji: '🗑️', label: 'Waste Mgmt', color: 'card-green' },
  { emoji: '🔒', label: 'Security', color: 'card-lavender' },
  { emoji: '🚪', label: 'Door Broken', color: 'card-cream' },
  { emoji: '🌳', label: 'Landscaping', color: 'card-green' },
  { emoji: '🖥️', label: 'Lab Equipment', color: 'card-sky' },
  { emoji: '🚻', label: 'Restroom', color: 'card-mint' },
  { emoji: '📢', label: 'Noise Issue', color: 'card-rose' },
] as const;

const CARD_RADIUS = 420; // px — radius of the circle
const CARD_COUNT = CAMPUS_CARDS.length;

interface LoginProps {
  onSignIn: (email: string, password: string, role: UserRole) => Promise<string | null>;
  onSignUp: (payload: {
    name: string;
    email: string;
    collegeId: string;
    password: string;
    role: UserRole;
  }) => Promise<string | null>;
  onGoHome: () => void;
}

type AuthPage = 'role-select' | 'sign-in' | 'sign-up';

const STUDENT_EMAIL_REGEX = /^[a-z0-9]+@grietcollege\.com$/i;
const ROLE_CONFIG = [
  {
    type: 'student' as UserRole,
    title: 'Student',
    icon: GraduationCap,
    description: 'Report issues and vote on priorities',
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    type: 'admin' as UserRole,
    title: 'Administrator',
    icon: Shield,
    description: 'Verify and manage reported issues',
    bg: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600'
  },
  {
    type: 'authority' as UserRole,
    title: 'Administration',
    icon: UserCog,
    description: 'Track and resolve priority issues',
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600'
  }
] as const;

export function Login({ onSignIn, onSignUp, onGoHome }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [authPage, setAuthPage] = useState<AuthPage>('role-select');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [signUpForm, setSignUpForm] = useState({
    name: '',
    email: '',
    collegeId: '',
    password: '',
    confirmPassword: ''
  });
  const [isStudentEmailVerified, setIsStudentEmailVerified] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRoleConfig = useMemo(
    () => ROLE_CONFIG.find(role => role.type === selectedRole),
    [selectedRole]
  );

  const resetMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const goToAuth = (page: 'sign-in' | 'sign-up') => {
    resetMessages();
    setAuthPage(page);
  };

  const resetToRoleSelect = () => {
    resetMessages();
    setAuthPage('role-select');
  };

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();
    setIsSubmitting(true);
    const error = await onSignIn(signInForm.email.trim(), signInForm.password, selectedRole);
    setIsSubmitting(false);
    if (error) {
      setErrorMessage(error);
      return;
    }
    setSuccessMessage('Signed in successfully.');
  };

  const handleStudentEmailVerification = () => {
    resetMessages();
    const normalizedEmail = signUpForm.email.trim().toLowerCase();
    if (!STUDENT_EMAIL_REGEX.test(normalizedEmail)) {
      setErrorMessage('Student sign up requires email format: rollno@grietcollege.com');
      setIsStudentEmailVerified(false);
      return;
    }
    setIsStudentEmailVerified(true);
    setSuccessMessage('College email verified.');
  };

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();

    if (!signUpForm.name.trim() || !signUpForm.email.trim() || !signUpForm.collegeId.trim()) {
      setErrorMessage('Please complete all required fields.');
      return;
    }
    if (signUpForm.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (signUpForm.password !== signUpForm.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (selectedRole === 'student' && !isStudentEmailVerified) {
      setErrorMessage('Please verify your college email before signing up.');
      return;
    }

    setIsSubmitting(true);
    const error = await onSignUp({
      name: signUpForm.name.trim(),
      email: signUpForm.email.trim().toLowerCase(),
      collegeId: signUpForm.collegeId.trim(),
      password: signUpForm.password,
      role: selectedRole
    });
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error);
      return;
    }
    setSuccessMessage('Account created successfully.');
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6" style={{ background: '#F8F6F3' }}>
      {/* ── Radial rotating card wheel ── */}
      <div className="radial-marquee">
        {CAMPUS_CARDS.map((card, i) => {
          const angle = (360 / CARD_COUNT) * i;
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * CARD_RADIUS;
          const y = Math.sin(rad) * CARD_RADIUS;
          return (
            <div
              key={i}
              className={`radial-card ${card.color}`}
              style={{
                transform: `translate(${x - 80}px, ${y - 55}px) rotate(${-angle}deg)`,
              }}
            >
              <span className="card-emoji">{card.emoji}</span>
              <span className="card-label">{card.label}</span>
            </div>
          );
        })}
      </div>

      {/* Vignette overlay */}
      <div className="radial-vignette" />

      <div className="relative mx-auto w-full max-w-5xl" style={{ zIndex: 2 }}>
        {/* ── Pill Navbar ── */}
        <div className="mb-8 flex items-center justify-between floating-nav px-4 py-3 max-w-2xl mx-auto">
          <button onClick={onGoHome} className="flex items-center gap-2.5 pl-2 hover:opacity-70 transition-opacity cursor-pointer">
            <div className="bg-[#1A1A2E] p-1.5 rounded-xl">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-archivo font-bold text-[#1A1A2E]">Let'sFix</span>
          </button>

          {authPage === 'role-select' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToAuth('sign-in')}
                className="px-4 py-2 text-sm font-semibold text-[#1A1A2E]/70 hover:text-[#1A1A2E] rounded-full hover:bg-black/5 transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => goToAuth('sign-up')}
                className="btn-pill-primary !py-2 !px-5 !text-sm"
              >
                Sign Up
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A1A2E]/5 text-xs font-semibold text-[#1A1A2E]/60">
                {selectedRoleConfig?.title}
              </span>
            </div>
          )}
        </div>

        {/* ── ROLE SELECT PAGE ── */}
        {authPage === 'role-select' && (
          <div className="max-w-2xl mx-auto">
            {/* Heading */}
            <div className="auth-card p-8 sm:p-10 text-center mb-6">
              <h2 className="font-archivo font-black text-[#1A1A2E] text-2xl sm:text-3xl">Welcome to Let'sFix</h2>
              <p className="text-[#1A1A2E]/50 mt-2 text-sm">Choose your role to get started</p>
            </div>

            {/* Role Cards — always visible */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {ROLE_CONFIG.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.type;
                return (
                  <button
                    key={role.type}
                    onClick={() => setSelectedRole(role.type)}
                    className={`role-card ${isSelected ? 'selected' : ''}`}
                  >
                    <div className={`feature-icon ${role.iconBg} ${role.iconColor} mb-3`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h4 className="font-archivo font-bold text-[#1A1A2E] text-base">{role.title}</h4>
                    <p className="mt-1 text-sm text-[#1A1A2E]/45">{role.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={() => goToAuth('sign-in')} className="btn-pill-primary w-full sm:w-auto justify-center !py-3 !px-8">
                Sign In as {selectedRoleConfig?.title} <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => goToAuth('sign-up')} className="btn-pill-secondary w-full sm:w-auto justify-center !py-3 !px-8">
                Create Account
              </button>
            </div>
          </div>
        )}

        {/* ── SIGN IN / SIGN UP FORM ── */}
        {authPage !== 'role-select' && (
          <div className="auth-card max-w-xl mx-auto p-8 sm:p-10">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={resetToRoleSelect}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#1A1A2E]/50 hover:text-[#1A1A2E] rounded-full px-3 py-1.5 hover:bg-black/5 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A1A2E]/5 text-xs font-semibold text-[#1A1A2E]/60">
                {selectedRoleConfig?.title}
              </span>
            </div>

            <h2 className="font-archivo font-black text-[#1A1A2E] text-2xl mb-1">
              {authPage === 'sign-in' ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-[#1A1A2E]/45 mb-6 text-sm">
              {authPage === 'sign-in'
                ? 'Use your registered credentials to continue.'
                : 'Create a new account for your role.'}
            </p>

            {errorMessage && (
              <div className="mb-4 rounded-2xl bg-red-50 border border-red-200/60 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 rounded-2xl bg-green-50 border border-green-200/60 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {successMessage}
              </div>
            )}

            {authPage === 'sign-in' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A2E]/70 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={signInForm.email}
                    onChange={(e) => setSignInForm(prev => ({ ...prev, email: e.target.value }))}
                    className="auth-input"
                    placeholder="name@grietcollege.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A2E]/70 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showSignInPassword ? 'text' : 'password'}
                      value={signInForm.password}
                      onChange={(e) => setSignInForm(prev => ({ ...prev, password: e.target.value }))}
                      className="auth-input !pr-11"
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(prev => !prev)}
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#1A1A2E]/30 hover:text-[#1A1A2E]/60 transition-colors"
                    >
                      {showSignInPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-pill-primary w-full justify-center !py-3.5 !text-base mt-2">
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                  {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => goToAuth('sign-up')}
                  className="w-full text-sm text-[#1A1A2E]/50 hover:text-[#1A1A2E] font-medium py-2 transition-colors"
                >
                  Need an account? <span className="font-semibold underline underline-offset-2">Sign up</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A2E]/70 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={signUpForm.name}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, name: e.target.value }))}
                    className="auth-input"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A2E]/70 mb-1.5">College Email</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      value={signUpForm.email}
                      onChange={(e) => {
                        setSignUpForm(prev => ({ ...prev, email: e.target.value }));
                        if (selectedRole === 'student') setIsStudentEmailVerified(false);
                      }}
                      className="auth-input"
                      placeholder={selectedRole === 'student' ? 'rollno@grietcollege.com' : 'name@college.edu'}
                      required
                    />
                    {selectedRole === 'student' && (
                      <button
                        type="button"
                        onClick={handleStudentEmailVerification}
                        className="btn-pill-secondary !py-2.5 !px-5 !text-sm whitespace-nowrap"
                      >
                        {isStudentEmailVerified ? <><CheckCircle className="w-4 h-4 text-green-600" /> Verified</> : 'Verify'}
                      </button>
                    )}
                  </div>
                  {selectedRole === 'student' && (
                    <p className="mt-1.5 text-xs text-[#1A1A2E]/40">Format: rollno@grietcollege.com</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A2E]/70 mb-1.5">
                    {selectedRole === 'student' ? 'College ID' : 'Employee ID'}
                  </label>
                  <input
                    type="text"
                    value={signUpForm.collegeId}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, collegeId: e.target.value }))}
                    className="auth-input"
                    placeholder={selectedRole === 'student' ? 'e.g. CS2021001' : 'e.g. ADMIN001'}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1A1A2E]/70 mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showSignUpPassword ? 'text' : 'password'}
                        value={signUpForm.password}
                        onChange={(e) => setSignUpForm(prev => ({ ...prev, password: e.target.value }))}
                        className="auth-input !pr-11"
                        placeholder="Min 6 characters"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(prev => !prev)}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#1A1A2E]/30 hover:text-[#1A1A2E]/60"
                      >
                        {showSignUpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1A1A2E]/70 mb-1.5">Confirm</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={signUpForm.confirmPassword}
                        onChange={(e) => setSignUpForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="auth-input !pr-11"
                        placeholder="Re-enter"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(prev => !prev)}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#1A1A2E]/30 hover:text-[#1A1A2E]/60"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-pill-primary w-full justify-center !py-3.5 !text-base mt-2">
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => goToAuth('sign-in')}
                  className="w-full text-sm text-[#1A1A2E]/50 hover:text-[#1A1A2E] font-medium py-2 transition-colors"
                >
                  Already have an account? <span className="font-semibold underline underline-offset-2">Sign in</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
