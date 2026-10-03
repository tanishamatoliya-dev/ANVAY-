import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

interface LegalProps {
  onNavigate: (tab: string) => void;
}

export const PrivacyPolicyPage: React.FC<LegalProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#fbfbf9] text-[#1e2321] py-12 px-6 sm:px-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <button
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-1.5 text-xs text-[#525f57] hover:text-[#1e2321]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Application</span>
        </button>

        <div className="border-b border-[#e7e5dc] pb-4">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#727f77] block mb-1">
            Legal & Data Governance
          </span>
          <h1 className="font-serif-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-[#1e2321]">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#627068] mt-1">
            Last Updated: October 2026. Prepared for independent clinical practice compliance review.
          </p>
        </div>

        <div className="space-y-6 text-xs text-[#414d45] leading-relaxed font-sans">
          <section className="space-y-2">
            <h2 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
              1. Information We Collect
            </h2>
            <p>
              UNLOX provides practice management software for licensed therapists. Information processed includes professional registration details (name, credentials, clinical title, contact information) and patient records provided during appointment scheduling and digital intake submission.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
              2. Data Separation and Clinical Records
            </h2>
            <p>
              Therapist clinical session notes (SOAP notes) are encrypted and stored in private database partitions. Patient accounts and third parties do not have permission or architectural access to private therapist notes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
              3. Payment Processing
            </h2>
            <p>
              Session billing is handled via Razorpay payment gateway integration. UNLOX servers do not store complete credit card or debit card numbers. Cryptographic signatures and order identifiers are retained for itemized invoice verification.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
              4. AI Workflow Capabilities
            </h2>
            <p>
              Optional AI assistive features (such as SOAP note drafting or intake summarization) are processed through Google Gemini API endpoints without patient identification disclosure. AI assistance does not make medical diagnoses.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
              5. Contact Information
            </h2>
            <p>
              For data privacy inquiries or record requests, contact: privacy@unlox.practice.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
