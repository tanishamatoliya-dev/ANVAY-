import React from 'react';
import { Calendar, FileText, CreditCard, MessageSquare, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#fbfbf9] text-[#1e2321]">
      {/* Top Bar */}
      <header className="border-b border-[#e7e5dc] bg-[#fdfdfc]/80 backdrop-blur-xs px-6 md:px-12 h-16 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#1e2321] text-[#fbfbf9] flex items-center justify-center font-serif text-lg font-bold">
            U
          </div>
          <span className="font-serif-editorial text-xl font-bold tracking-tight text-[#1e2321]">
            UNLOX
          </span>
        </div>

        <nav className="flex items-center gap-4 text-xs font-medium">
          <button
            onClick={() => onNavigate('public_booking_dr-clara-vance')}
            className="text-[#556259] hover:text-[#1e2321] hidden sm:block"
          >
            Sample Public Profile
          </button>
          <button
            onClick={() => onNavigate('login')}
            className="px-3.5 py-1.5 border border-[#d8d4c8] rounded text-[#2c3730] hover:bg-[#f3f0e6]"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="px-4 py-1.5 bg-[#1e2321] text-white rounded hover:bg-[#2e3732] shadow-xs"
          >
            Create Practice
          </button>
        </nav>
      </header>

      {/* Hero Section (Restrained Editorial, Zero Fluff) */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#f2efe6] border border-[#ded8cb] text-xs text-[#415046] mb-6 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
          <span>Practice management architecture for licensed therapists</span>
        </div>

        <h1 className="font-serif-editorial text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#1e2321] leading-[1.08] max-w-3xl">
          Clinical workflow designed for independent psychotherapy.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[#55625a] max-w-2xl leading-relaxed">
          UNLOX unifies appointment scheduling, confidential intake, encrypted clinical SOAP notes, Razorpay billing, and secure client communication into one calm, disciplined system.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('register')}
            className="px-5 py-2.5 bg-[#1e2321] text-white text-xs sm:text-sm font-medium rounded hover:bg-[#2c3631] shadow-xs flex items-center gap-2"
          >
            <span>Start Practice Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-5 py-2.5 bg-[#f2efe6] text-[#28352d] border border-[#d8d3c5] text-xs sm:text-sm font-medium rounded hover:bg-[#eae5d8]"
          >
            Explore Live Dashboard
          </button>
          <button
            onClick={() => onNavigate('public_booking_dr-clara-vance')}
            className="px-4 py-2.5 text-[#546259] hover:text-[#1e2321] text-xs sm:text-sm font-medium"
          >
            View Public Booking Flow →
          </button>
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
            <div className="p-6 bg-white border border-[#e2dfd5] rounded space-y-3">
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

            <div className="p-6 bg-white border border-[#e2dfd5] rounded space-y-3">
              <div className="w-8 h-8 rounded bg-[#f3efe6] flex items-center justify-center text-[#35433a]">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
                Confidential SOAP Notes
              </h3>
              <p className="text-xs text-[#5e6b63] leading-relaxed">
                Structured Subjective, Objective, Assessment, and Plan documentation. Encrypted at rest and strictly excluded from client-facing APIs.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#e2dfd5] rounded space-y-3">
              <div className="w-8 h-8 rounded bg-[#f3efe6] flex items-center justify-center text-[#35433a]">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
                Razorpay Billing & Invoices
              </h3>
              <p className="text-xs text-[#5e6b63] leading-relaxed">
                Order creation and cryptographic HMAC signature verification processed entirely server-side. Generates compliant itemized receipts.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#e2dfd5] rounded space-y-3">
              <div className="w-8 h-8 rounded bg-[#f3efe6] flex items-center justify-center text-[#35433a]">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
                Real-Time Messaging
              </h3>
              <p className="text-xs text-[#5e6b63] leading-relaxed">
                Socket.io real-time therapeutic communication channel with typing feedback, read confirmations, and instant notifications.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#e2dfd5] rounded space-y-3 md:col-span-2">
              <div className="w-8 h-8 rounded bg-[#f3efe6] flex items-center justify-center text-[#35433a]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
                Strict Data Boundary & Entitlement Separation
              </h3>
              <p className="text-xs text-[#5e6b63] leading-relaxed">
                Centralized subscription governance controls feature access across Starter, Professional, and Practice tiers. Client accounts can never inspect therapist private notes or cross-tenant records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="border-t border-[#e7e5dc] py-12 px-6 md:px-12 bg-white text-xs text-[#637068]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif-editorial text-base font-bold text-[#1e2321]">UNLOX</span>
            <span className="text-[#88938c]">Practice Management Architecture</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('privacy-policy')} className="hover:text-[#1e2321]">
              Privacy Policy
            </button>
            <button onClick={() => onNavigate('terms-and-conditions')} className="hover:text-[#1e2321]">
              Terms and Conditions
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
