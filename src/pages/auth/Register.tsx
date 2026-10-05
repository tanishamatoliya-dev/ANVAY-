import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Compass, ArrowRight } from 'lucide-react';

interface RegisterProps {
  onNavigate: (tab: string) => void;
}

export const RegisterPage: React.FC<RegisterProps> = ({ onNavigate }) => {
  const { register, enterGuestMode } = useAuth();
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
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: 'therapist',
        title: title.trim(),
      });
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestExplore = async () => {
    try {
      setLoading(true);
      setError(null);
      await enterGuestMode('therapist');
      onNavigate('dashboard');
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
          Start your ANVAY practice
        </h2>
        <p className="mt-1 text-xs text-[#637068]">
          Practice Management Architecture for Independent Therapists
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 space-y-4">
        {/* Open Guest Explore Option */}
        <div className="p-4 bg-[#f2efe6] border border-[#d8d3c5] rounded shadow-xs text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#1e2321]">
            <Compass className="w-4 h-4 text-emerald-800" />
            <span>Not Ready to Register? Explore First</span>
          </div>
          <p className="text-[11px] text-[#55635a]">
            You can test the entire platform without creating an account.
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={handleGuestExplore}
              className="px-4 py-2 bg-[#1e2321] text-white text-xs font-medium rounded hover:bg-[#2b3530] shadow-xs inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Explore Platform in Guest Mode</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="bg-[#fdfdfc] py-7 px-6 sm:px-10 border border-[#e2dfd5] rounded shadow-xs space-y-5">
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
                placeholder="e.g. Dr. Maya Patel, Psy.D."
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
                placeholder="maya.patel@practice.com"
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
