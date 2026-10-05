import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  FileText,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  Compass,
} from 'lucide-react';

interface LandingProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingProps> = ({ onNavigate }) => {
  const { enterGuestMode } = useAuth();

  const handleExplore = async (role: 'therapist' | 'client' = 'therapist') => {
    try {
      await enterGuestMode(role);
      onNavigate(role === 'therapist' ? 'dashboard' : 'portal');
    } catch (err) {
      console.error(err);
      onNavigate('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-[#1e2321] selection:bg-[#dedacb]">
      {/* Editorial Announcement Banner */}
      <div className="bg-[#1e2321] text-[#e8e5dc] px-4 py-2 text-xs flex items-center justify-between">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-medium text-[11px] sm:text-xs">
              Open Guest Exploration Active: No registration or sign-in required to test all features.
            </span>
          </div>
          <button
            onClick={() => handleExplore('therapist')}
            className="text-[11px] font-semibold underline underline-offset-4 hover:text-white shrink-0"
          >
            Launch Guest Demo →
          </button>
        </div>
      </div>

      {/* Top Header */}
      <header className="border-b border-[#e7e5dc] bg-[#fdfdfc]/90 backdrop-blur-xs px-6 md:px-12 h-16 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#1e2321] text-[#fbfbf9] flex items-center justify-center font-serif text-lg font-bold">
            A
          </div>
          <span className="font-serif-editorial text-xl font-bold tracking-tight text-[#1e2321]">
            ANVAY
          </span>
        </div>

        <nav className="flex items-center gap-3">
          <button
            onClick={() => handleExplore('therapist')}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#1e2321] bg-[#f0ede4] hover:bg-[#e6e2d6] border border-[#d2cebf] rounded flex items-center gap-1.5 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-800" />
            <span>Explore (No Sign-in)</span>
          </button>
          <button
            onClick={() => onNavigate('login')}
            className="px-3 py-1.5 text-xs font-medium text-[#46534b] hover:text-[#1e2321] transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="px-4 py-1.5 text-xs font-medium text-white bg-[#1e2321] hover:bg-[#2e3732] rounded shadow-xs transition-colors"
          >
            Create Account
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-14 pb-20 md:pt-20 md:pb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#f2efe6] border border-[#ded8cb] text-xs text-[#415046] mb-6 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
          <span>Practice management architecture for licensed therapists</span>
        </div>

        <h1 className="font-serif-editorial text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#1e2321] leading-[1.08] max-w-3xl">
          Clinical workflow designed for independent psychotherapy.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[#55625a] max-w-2xl leading-relaxed">
          ANVAY unifies appointment scheduling, confidential intake, encrypted clinical SOAP notes, direct practice invoicing, and secure client communication into one calm, disciplined system.
        </p>

        {/* Action Hub with Guest Explore Prominence */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleExplore('therapist')}
            className="px-6 py-3 bg-[#1e2321] text-white text-xs sm:text-sm font-semibold rounded hover:bg-[#2c3631] shadow-xs flex items-center gap-2.5 transition-all"
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Explore Live Platform (No Sign-in Needed)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleExplore('client')}
            className="px-5 py-3 bg-[#f2efe6] text-[#28352d] border border-[#d8d3c5] text-xs sm:text-sm font-medium rounded hover:bg-[#eae5d8] transition-colors"
          >
            View Client Portal Demo
          </button>

          <button
            onClick={() => onNavigate('public_booking_dr-clara-vance')}
            className="px-4 py-3 text-[#546259] hover:text-[#1e2321] text-xs sm:text-sm font-medium transition-colors"
          >
            Public Booking Page →
          </button>
        </div>

        <div className="mt-4 flex items-center gap-4 text-[11px] text-[#78847d]">
          <span>✓ Zero setup required</span>
          <span>✓ Free guest exploration</span>
          <span>✓ Switch between Therapist & Client view</span>
        </div>
      </section>

      {/* Architectural Principles Grid */}
      <section className="border-t border-[#e7e5dc] bg-[#f8f7f2] py-16 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif-editorial text-2xl sm:text-3xl font-semibold text-[#1e2321] mb-2">
            Five core clinical capabilities
          </h2>
          <p className="text-xs sm:text-sm text-[#616e66] max-w-xl mb-12">
            Structured around the actual day-to-day rhythm of private clinical practice.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-[#e2dfd5] rounded space-y-3 shadow-xs">
              <div className="w-8 h-8 rounded bg-[#f3efe6] flex items-center justify-center text-[#35433a]">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
                Conflict-Free Scheduling
              </h3>
              <p className="text-xs text-[#5e6b63] leading-relaxed">
                Therapist weekly availability with mandatory inter-session buffer periods. Double-booking is strictly prohibited at the database level.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#e2dfd5] rounded space-y-3 shadow-xs">
              <div className="w-8 h-8 rounded bg-[#f3efe6] flex items-center justify-center text-[#35433a]">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
                Confidential SOAP Notes
              </h3>
              <p className="text-xs text-[#5e6b63] leading-relaxed">
                Therapist-only session documentation with permanent lock capabilities for clinical compliance and privacy.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#e2dfd5] rounded space-y-3 shadow-xs">
              <div className="w-8 h-8 rounded bg-[#f3efe6] flex items-center justify-center text-[#35433a]">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
                Direct Practice Invoicing
              </h3>
              <p className="text-xs text-[#5e6b63] leading-relaxed">
                Itemized invoice generation, payment tracking, and ledger history supporting bank transfers, cards, cash, or insurance reimbursement.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#e2dfd5] rounded space-y-3 shadow-xs">
              <div className="w-8 h-8 rounded bg-[#f3efe6] flex items-center justify-center text-[#35433a]">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
                Real-Time Messaging
              </h3>
              <p className="text-xs text-[#5e6b63] leading-relaxed">
                Encrypted communication channel with instant message delivery, unread indicators, and clinical boundary management.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#e2dfd5] rounded space-y-3 shadow-xs">
              <div className="w-8 h-8 rounded bg-[#f3efe6] flex items-center justify-center text-[#35433a]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
                AI Clinical Assistant
              </h3>
              <p className="text-xs text-[#5e6b63] leading-relaxed">
                Objective intake synthesis, draft SOAP note formatting, and therapeutic correspondence structuring powered by Google Gemini.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#e2dfd5] rounded space-y-3 shadow-xs">
              <div className="w-8 h-8 rounded bg-[#f3efe6] flex items-center justify-center text-[#35433a]">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
                Client Self-Service
              </h3>
              <p className="text-xs text-[#5e6b63] leading-relaxed">
                Dedicated client portal for upcoming appointments, digital intake questionnaires, invoice records, and telehealth links.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e7e5dc] py-12 px-6 md:px-12 bg-white text-xs text-[#637068]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif-editorial text-base font-bold text-[#1e2321]">ANVAY</span>
            <span className="text-[#88938c]">Practice Management Architecture</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => handleExplore('therapist')}
              className="text-emerald-800 font-medium hover:underline"
            >
              Guest Explorer
            </button>
            <button
              onClick={() => onNavigate('privacy-policy')}
              className="hover:text-[#1e2321] transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onNavigate('terms-and-conditions')}
              className="hover:text-[#1e2321] transition-colors"
            >
              Terms and Conditions
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
