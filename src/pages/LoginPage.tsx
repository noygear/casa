import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Building2, LogIn, Eye, EyeOff } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { email: 'sarah.chen@casa.com', role: 'Asset Manager', color: 'text-violet-400' },
  { email: 'james.porter@meridianpm.com', role: 'Property Manager', color: 'text-cre-400' },
  { email: 'ops@alphahvac.com', role: 'Vendor (HVAC)', color: 'text-amber-400' },
  { email: 'dispatch@sparkelectric.com', role: 'Vendor (Electrical)', color: 'text-amber-400' },
  { email: 'tenant@greenleafcorp.com', role: 'Tenant', color: 'text-emerald-400' },
];

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setIsSubmitting(true);
    setError('');
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Invalid email or password');
    }
    setIsSubmitting(false);
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Casa2025!');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cre-950">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cre-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cre-500/3 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cre-500 to-cre-700 mb-4 shadow-xl shadow-cre-500/20">
            <Building2 size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Casa</h1>
          <p className="text-sm text-gray-400 mt-1">Operations Platform</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8">
          <h2 className="text-lg font-semibold text-white mb-1">Sign In</h2>
          <p className="text-sm text-gray-400 mb-6">Enter your credentials to continue</p>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@casa.com"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cre-500/50 focus:border-cre-500/50 transition-colors"
                id="email-input"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cre-500/50 focus:border-cre-500/50 transition-colors"
                  id="password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !email || !password}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cre-500 to-cre-600 text-white font-semibold text-sm hover:from-cre-400 hover:to-cre-500 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-cre-500/20"
              id="login-button"
            >
              <LogIn size={16} />
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 pt-5 border-t border-white/5">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-3">Demo Accounts</p>
            <div className="space-y-1.5">
              {DEMO_ACCOUNTS.map((acct) => (
                <button
                  key={acct.email}
                  onClick={() => fillDemo(acct.email)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
                >
                  <span className="text-xs text-gray-400 group-hover:text-gray-300 truncate">{acct.email}</span>
                  <span className={`text-[10px] ${acct.color} shrink-0 ml-2`}>{acct.role}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-600 mt-2">Password: Casa2025!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
