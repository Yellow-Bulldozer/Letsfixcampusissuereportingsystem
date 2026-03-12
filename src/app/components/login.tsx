import { FormEvent, useMemo, useState } from 'react';
import { UserRole } from '../types';
import { ArrowLeft, Eye, EyeOff, GraduationCap, Shield, UserCog } from 'lucide-react';

interface LoginProps {
  onSignIn: (email: string, password: string, role: UserRole) => Promise<string | null>;
  onSignUp: (payload: {
    name: string;
    email: string;
    collegeId: string;
    password: string;
    role: UserRole;
  }) => Promise<string | null>;
}

type AuthPage = 'role-select' | 'sign-in' | 'sign-up';

const STUDENT_EMAIL_REGEX = /^[a-z0-9]+@grietcollege\.com$/i;
const ROLE_CONFIG = [
  {
    type: 'student' as UserRole,
    title: 'Student',
    icon: GraduationCap,
    description: 'Report issues and vote on priorities',
    color: 'bg-blue-500'
  },
  {
    type: 'admin' as UserRole,
    title: 'Administrator',
    icon: Shield,
    description: 'Verify and manage reported issues',
    color: 'bg-purple-500'
  },
  {
    type: 'authority' as UserRole,
    title: 'Administration',
    icon: UserCog,
    description: 'Track and resolve priority issues',
    color: 'bg-green-500'
  }
] as const;

export function Login({ onSignIn, onSignUp }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [authPage, setAuthPage] = useState<AuthPage>('role-select');
  const [rolePickerIntent, setRolePickerIntent] = useState<'sign-in' | 'sign-up' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [signInForm, setSignInForm] = useState({
    email: '',
    password: ''
  });

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

  const openAuthPage = (page: 'sign-in' | 'sign-up') => {
    resetMessages();
    setRolePickerIntent(page);
  };

  const resetToRoleSelect = () => {
    resetMessages();
    setAuthPage('role-select');
  };

  const handleRoleSelectionConfirm = () => {
    if (!rolePickerIntent) return;
    resetMessages();
    setAuthPage(rolePickerIntent);
    setRolePickerIntent(null);
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#dff1ff] via-[#f2f7ff] to-[#ece8ff] px-4 py-8">
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-300/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-violet-300/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-cyan-300/25 blur-3xl" />

      <div className="relative mx-auto w-full max-w-6xl">
        <div className="mb-8 flex items-center justify-between rounded-3xl border border-white/50 bg-white/45 px-5 py-4 shadow-[0_8px_32px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2.5">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Let'sFix</h1>
              <p className="text-xs text-slate-500">Campus Issue Resolution Platform</p>
            </div>
          </div>

          {authPage === 'role-select' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthPage('sign-in')}
                className="rounded-xl border border-white/60 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white/80"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthPage('sign-up')}
                className="rounded-xl bg-blue-600/90 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Sign Up
              </button>
            </div>
          ) : (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {selectedRoleConfig?.title}
            </span>
          )}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 rounded-3xl border border-white/50 bg-white/40 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.1)] backdrop-blur-xl lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-slate-900">Professional campus issue reporting for every role</h2>
            <p className="mt-2 text-slate-700">
              Students report and vote, administrators verify, and administration resolves with transparent tracking.
            </p>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
            <p className="text-sm font-semibold text-slate-800">Built for fast campus action</p>
            <p className="mt-1 text-xs text-slate-600">
              Clear workflows, verified updates, and transparent resolution status.
            </p>
          </div>
        </div>

        {/* Auth Content */}
        <div className="mb-6 rounded-3xl border border-white/50 bg-white/50 p-8 shadow-[0_20px_50px_rgba(15,23,42,0.14)] backdrop-blur-xl">
          {authPage === 'role-select' && (
            <>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Welcome to Let'sFix</h2>
            </>
          )}

          {authPage !== 'role-select' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={resetToRoleSelect}
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <span className="text-sm text-gray-500">{selectedRoleConfig?.title}</span>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {authPage === 'sign-in' ? `Sign In - ${selectedRoleConfig?.title}` : `Sign Up - ${selectedRoleConfig?.title}`}
              </h2>
              <p className="text-gray-600 mb-6">
                {authPage === 'sign-in'
                  ? 'Use your registered credentials to continue.'
                  : 'Create a new account for your role.'}
              </p>

              {errorMessage && (
                <div className="mb-4 rounded-xl border border-red-200/70 bg-red-50/80 px-4 py-3 text-sm text-red-700 backdrop-blur">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="mb-4 rounded-xl border border-green-200/70 bg-green-50/80 px-4 py-3 text-sm text-green-700 backdrop-blur">
                  {successMessage}
                </div>
              )}

              {authPage === 'sign-in' ? (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={signInForm.email}
                      onChange={(event) => setSignInForm(prev => ({ ...prev, email: event.target.value }))}
                      className="w-full rounded-xl border border-white/70 bg-white/80 px-3 py-2.5 shadow-sm focus:border-blue-500 focus:outline-none"
                      placeholder="name@college.edu"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showSignInPassword ? 'text' : 'password'}
                        value={signInForm.password}
                        onChange={(event) => setSignInForm(prev => ({ ...prev, password: event.target.value }))}
                        className="w-full rounded-xl border border-white/70 bg-white/80 px-3 py-2.5 pr-11 shadow-sm focus:border-blue-500 focus:outline-none"
                        placeholder="Enter password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPassword(prev => !prev)}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 hover:text-gray-800"
                        aria-label={showSignInPassword ? 'Hide password' : 'Show password'}
                      >
                        {showSignInPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-blue-600/95 px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthPage('sign-up')}
                    className="w-full text-sm text-blue-700 hover:text-blue-900"
                  >
                    Need an account? Sign up
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={signUpForm.name}
                      onChange={(event) => setSignUpForm(prev => ({ ...prev, name: event.target.value }))}
                      className="w-full rounded-xl border border-white/70 bg-white/80 px-3 py-2.5 shadow-sm focus:border-blue-500 focus:outline-none"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">College Email</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="email"
                        value={signUpForm.email}
                        onChange={(event) => {
                          setSignUpForm(prev => ({ ...prev, email: event.target.value }));
                          if (selectedRole === 'student') {
                            setIsStudentEmailVerified(false);
                          }
                        }}
                        className="w-full rounded-xl border border-white/70 bg-white/80 px-3 py-2.5 shadow-sm focus:border-blue-500 focus:outline-none"
                        placeholder={selectedRole === 'student' ? 'rollno@grietcollege.com' : 'name@college.edu'}
                        required
                      />
                      {selectedRole === 'student' && (
                        <button
                          type="button"
                          onClick={handleStudentEmailVerification}
                          className="sm:w-auto w-full whitespace-nowrap rounded-xl border border-blue-500/60 bg-blue-50/70 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100/80"
                        >
                          Verify Email
                        </button>
                      )}
                    </div>
                    {selectedRole === 'student' && (
                      <p className="mt-1 text-xs text-gray-500">
                        Students must verify email in this format: `rollno@grietcollege.com`.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {selectedRole === 'student' ? 'College ID' : 'Employee ID'}
                    </label>
                    <input
                      type="text"
                      value={signUpForm.collegeId}
                      onChange={(event) => setSignUpForm(prev => ({ ...prev, collegeId: event.target.value }))}
                      className="w-full rounded-xl border border-white/70 bg-white/80 px-3 py-2.5 shadow-sm focus:border-blue-500 focus:outline-none"
                      placeholder={selectedRole === 'student' ? 'e.g. CS2021001' : 'e.g. ADMIN001'}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <div className="relative">
                        <input
                          type={showSignUpPassword ? 'text' : 'password'}
                          value={signUpForm.password}
                          onChange={(event) => setSignUpForm(prev => ({ ...prev, password: event.target.value }))}
                          className="w-full rounded-xl border border-white/70 bg-white/80 px-3 py-2.5 pr-11 shadow-sm focus:border-blue-500 focus:outline-none"
                          placeholder="Minimum 6 characters"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignUpPassword(prev => !prev)}
                          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 hover:text-gray-800"
                          aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
                        >
                          {showSignUpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={signUpForm.confirmPassword}
                          onChange={(event) => setSignUpForm(prev => ({ ...prev, confirmPassword: event.target.value }))}
                          className="w-full rounded-xl border border-white/70 bg-white/80 px-3 py-2.5 pr-11 shadow-sm focus:border-blue-500 focus:outline-none"
                          placeholder="Re-enter password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(prev => !prev)}
                          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 hover:text-gray-800"
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-blue-600/95 px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthPage('sign-in')}
                    className="w-full text-sm text-blue-700 hover:text-blue-900"
                  >
                    Already have an account? Sign in
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Info Section */}
        <div className="rounded-3xl border border-white/50 bg-white/45 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.1)] backdrop-blur-xl">
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
              <span className="font-semibold min-w-fit">Administration:</span>
              <span>Track and resolve priority issues transparently</span>
            </li>
          </ul>
        </div>
      </div>

      {rolePickerIntent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-3xl border border-white/50 bg-white/55 p-6 shadow-[0_24px_50px_rgba(15,23,42,0.2)] backdrop-blur-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">
                Select Role to {rolePickerIntent === 'sign-in' ? 'Sign In' : 'Sign Up'}
              </h3>
              <button
                onClick={() => setRolePickerIntent(null)}
                className="rounded-xl border border-white/70 bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-white"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {ROLE_CONFIG.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.type;

                return (
                  <button
                    key={role.type}
                    onClick={() => setSelectedRole(role.type)}
                    className={`rounded-2xl border p-5 text-left transition-all ${
                      isSelected
                        ? 'border-blue-400 bg-blue-50/80 shadow-lg'
                        : 'border-white/60 bg-white/55 hover:-translate-y-0.5 hover:shadow-md'
                    }`}
                  >
                    <div className={`${role.color} mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900">{role.title}</h4>
                    <p className="mt-1 text-sm text-gray-600">{role.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleRoleSelectionConfirm}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Continue as {selectedRoleConfig?.title}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
