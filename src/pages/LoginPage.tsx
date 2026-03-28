import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_USERS, MOCK_VENDORS } from '../data/mockData';
import { ROLE_LABELS } from '../types';
import { Building2, LogIn, ChevronDown } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const [selectedUser, setSelectedUser] = useState('');
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogin = () => {
    if (!selectedUser) {
      setError('Please select a user');
      return;
    }
    const success = login(selectedUser);
    if (!success) setError('Login failed');
  };

  const selected = MOCK_USERS.find(u => u.email === selectedUser);

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
          <p className="text-sm text-gray-400 mb-6">Select a demo user to continue</p>

          {/* User Selector */}
          <div className="relative mb-6">
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Demo User
            </label>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/8 transition-colors"
              id="user-selector"
            >
              {selected ? (
                <div>
                  <div className="text-sm font-medium text-white">
                    {selected.name}
                    {selected.role === 'vendor' && selected.vendorId && (
                      <span className="text-amber-400 font-normal">
                        {' — '}
                        {MOCK_VENDORS.find(v => v.id === selected.vendorId)?.companyName} 
                        {' '}({MOCK_VENDORS.find(v => v.id === selected.vendorId)?.specialties[0]})
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">{ROLE_LABELS[selected.role]} · {selected.email}</div>
                </div>
              ) : (
                <span className="text-sm text-gray-500">Choose a user...</span>
              )}
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div className="absolute z-20 w-full mt-2 py-1 bg-cre-950 border border-white/10 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                {MOCK_USERS.map(user => (
                  <button
                    key={user.id}
                    onClick={() => { setSelectedUser(user.email); setShowDropdown(false); setError(''); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                    id={`select-user-${user.id}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      user.role === 'asset_manager' ? 'bg-violet-500/20 text-violet-400'
                        : user.role === 'property_manager' ? 'bg-cre-500/20 text-cre-400'
                        : user.role === 'vendor' ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {user.name}
                        {user.role === 'vendor' && user.vendorId && (
                          <span className="text-amber-400 font-normal">
                            {' — '}
                            {MOCK_VENDORS.find(v => v.id === user.vendorId)?.companyName} 
                            {' '}({MOCK_VENDORS.find(v => v.id === user.vendorId)?.specialties[0]})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500">{ROLE_LABELS[user.role]}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={!selectedUser}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cre-500 to-cre-600 text-white font-semibold text-sm hover:from-cre-400 hover:to-cre-500 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-cre-500/20"
            id="login-button"
          >
            <LogIn size={16} />
            Sign In
          </button>

          {/* Role Legend */}
          <div className="mt-6 pt-5 border-t border-white/5">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-3">Roles</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: 'Asset Manager', color: 'bg-violet-500', desc: 'Full authority' },
                { role: 'Property Manager', color: 'bg-cre-500', desc: 'Day-to-day ops' },
                { role: 'Vendor', color: 'bg-amber-500', desc: 'Executes work' },
                { role: 'Tenant', color: 'bg-emerald-500', desc: 'Submits requests' },
              ].map(r => (
                <div key={r.role} className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${r.color}`} />
                  <span className="text-[10px] text-gray-400">{r.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
