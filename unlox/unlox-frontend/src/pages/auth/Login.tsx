import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface LoginProps {
  onNavigate: (tab: string) => void;
}

export const LoginPage: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login, quickDemoLogin } = useAuth();
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
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbf9] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[#1e2321]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-10 h-10 rounded bg-[#1e2321] text-white flex items-center justify-center font-serif text-xl font-bold mx-auto mb-3">
          U
        </div>
        <h2 className="font-serif-editorial text-3xl font-semibold tracking-tight text-[#1e2321]">
          Sign in to UNLOX
        </h2>
        <p className="mt-1 text-xs text-[#637068]">
          Practice Management Platform for Therapists & Clients
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[#fdfdfc] py-8 px-6 sm:px-10 border border-[#e2dfd5] rounded shadow-xs space-y-6">
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

          {/* Development Quick-Demo Login Credentials */}
          <div className="pt-4 border-t border-[#eeebe3] space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#79857e] block text-center">
              Quick Demo Access
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={async () => {
                  await quickDemoLogin('therapist');
                  onNavigate('dashboard');
                }}
                className="p-2 text-left bg-[#f4f2ea] hover:bg-[#eae5d8] border border-[#d8d3c5] rounded transition-colors"
              >
                <span className="font-semibold block text-[#1e2321] text-[11px]">Dr. Clara Vance</span>
                <span className="text-[10px] text-[#6d7972]">Therapist Account</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  await quickDemoLogin('client');
                  onNavigate('portal');
                }}
                className="p-2 text-left bg-[#f4f2ea] hover:bg-[#eae5d8] border border-[#d8d3c5] rounded transition-colors"
              >
                <span className="font-semibold block text-[#1e2321] text-[11px]">Julian Ross</span>
                <span className="text-[10px] text-[#6d7972]">Client Account</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-[#637068]">
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
