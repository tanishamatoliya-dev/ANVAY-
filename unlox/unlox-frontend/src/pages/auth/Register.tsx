import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface RegisterProps {
  onNavigate: (tab: string) => void;
}

export const RegisterPage: React.FC<RegisterProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('Licensed Clinical Psychologist');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await register({
        name,
        email,
        password,
        role: 'therapist',
        title,
      });
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
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
          Start your UNLOX practice
        </h2>
        <p className="mt-1 text-xs text-[#637068]">
          Practice Management Architecture for Independent Therapists
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[#fdfdfc] py-8 px-6 sm:px-10 border border-[#e2dfd5] rounded shadow-xs space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1e2321] mb-1">
                Full Professional Name & Credentials *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Jane Doe, Psy.D."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1e2321] mb-1">
                Clinical License / Professional Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Licensed Marriage & Family Therapist"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1e2321] mb-1">
                Practice Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="jane.doe@practice.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1e2321] mb-1">
                Secure Password *
              </label>
              <input
                type="password"
                required
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-xs font-semibold text-white bg-[#1e2321] hover:bg-[#2c3631] disabled:opacity-50 rounded shadow-xs transition-colors"
            >
              {loading ? 'Creating Practice Account...' : 'Initialize Practice Account'}
            </button>
          </form>

          <div className="text-center text-xs text-[#637068] pt-2 border-t border-[#eeebe3]">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="font-semibold text-[#1e2321] hover:underline"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
