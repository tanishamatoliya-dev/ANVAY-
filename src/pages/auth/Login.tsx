import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Compass, ArrowRight, UserCheck } from 'lucide-react';

interface LoginProps {
  onNavigate: (tab: string) => void;
}

export const LoginPage: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login, quickDemoLogin, enterGuestMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestExplore = async (role: 'therapist' | 'client' = 'therapist') => {
    try {
      setLoading(true);
      setError(null);
      await enterGuestMode(role);
      onNavigate(role === 'therapist' ? 'dashboard' : 'portal');
    } catch (err: any) {
      setError(err.message || 'Unable to start guest exploration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbf9] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[#1e2321]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div 
          onClick={() => onNavigate('landing')}
          className="cursor-pointer inline-flex items-center justify-center w-10 h-10 rounded bg-[#1e2321] text-white font-serif text-xl font-bold mb-3 hover:opacity-90"
        >
          A
        </div>
        <h2 className="font-serif-editorial text-3xl font-semibold tracking-tight text-[#1e2321]">
          Sign in to ANVAY
        </h2>
        <p className="mt-1 text-xs text-[#637068]">
          Practice Management Platform for Therapists & Clients
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 space-y-4">
        {/* Open Guest Explore Option */}
        <div className="p-4 bg-[#f2efe6] border border-[#d8d3c5] rounded shadow-xs text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#1e2321]">
            <Compass className="w-4 h-4 text-emerald-800" />
            <span>Just Want to Explore Without an Account?</span>
          </div>
          <p className="text-[11px] text-[#55635a]">
            Access the full application as a guest. No registration, credentials, or setup needed.
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleGuestExplore('therapist')}
              className="px-4 py-2 bg-[#1e2321] text-white text-xs font-medium rounded hover:bg-[#2b3530] shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Explore as Therapist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleGuestExplore('client')}
              className="px-3 py-2 bg-white border border-[#cfcbc0] text-[#334037] text-xs font-medium rounded hover:bg-[#f9f8f5] transition-colors"
            >
              Client Portal Demo
            </button>
          </div>
        </div>

        <div className="bg-[#fdfdfc] py-7 px-6 sm:px-10 border border-[#e2dfd5] rounded shadow-xs space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1e2321] mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="e.g. dr.clara@anvay.practice"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321] focus:border-[#2e3b33] focus:ring-1 focus:ring-[#2e3b33]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1e2321] mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321] focus:border-[#2e3b33] focus:ring-1 focus:ring-[#2e3b33]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-xs font-semibold text-white bg-[#1e2321] hover:bg-[#2c3631] disabled:opacity-50 rounded shadow-xs transition-colors"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Pre-fill Links */}
          <div className="pt-3 border-t border-[#eeebe3] space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#79857e] block text-center">
              Quick Pre-Seeded Accounts
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={async () => {
                  setEmail('dr.clara@anvay.practice');
                  setPassword('Password123!');
                  await quickDemoLogin('therapist');
                  onNavigate('dashboard');
                }}
                className="p-2 text-left bg-[#f4f2ea] hover:bg-[#eae5d8] border border-[#d8d3c5] rounded transition-colors"
              >
                <span className="font-semibold block text-[#1e2321] text-[11px]">Dr. Clara Vance</span>
                <span className="text-[10px] text-[#6d7972]">Therapist Practice</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setEmail('julian.ross@example.com');
                  setPassword('Password123!');
                  await quickDemoLogin('client');
                  onNavigate('portal');
                }}
                className="p-2 text-left bg-[#f4f2ea] hover:bg-[#eae5d8] border border-[#d8d3c5] rounded transition-colors"
              >
                <span className="font-semibold block text-[#1e2321] text-[11px]">Julian Ross</span>
                <span className="text-[10px] text-[#6d7972]">Client Portal</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-[#637068] pt-1 border-t border-[#eeebe3]">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="font-semibold text-[#1e2321] hover:underline"
            >
              Create therapist practice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
