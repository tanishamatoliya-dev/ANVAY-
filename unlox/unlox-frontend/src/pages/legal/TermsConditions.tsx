import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface LegalProps {
  onNavigate: (tab: string) => void;
}

export const TermsConditionsPage: React.FC<LegalProps> = ({ onNavigate }) => {
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
            Governance & Use
          </span>
          <h1 className="font-serif-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-[#1e2321]">
            Terms and Conditions
          </h1>
          <p className="text-xs text-[#627068] mt-1">
            Last Updated: October 2026. Standard terms for software as a service platform.
          </p>
        </div>

        <div className="space-y-6 text-xs text-[#414d45] leading-relaxed font-sans">
          <section className="space-y-2">
            <h2 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using the UNLOX platform, therapists and registered clients agree to be bound by these Terms and Conditions. UNLOX is a technology infrastructure provider and does not provide direct clinical healthcare services.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
              2. Therapist Clinical Responsibility
            </h2>
            <p>
              Practitioners using UNLOX remain independently licensed professionals solely responsible for clinical decisions, patient care, diagnostic documentation, informed consent, and emergency protocol compliance within their respective jurisdictions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
              3. Subscription & Billing
            </h2>
            <p>
              Therapist subscription fees are billed on a recurring monthly or annual schedule via Razorpay. Tiers govern client limits, analytical modules, and assistant tooling according to the active entitlement configuration.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
              4. Disclaimer Regarding Emergency Services
            </h2>
            <p>
              UNLOX is not an emergency response service. In the event of a medical or mental health emergency, users must contact emergency medical services or national crisis hotlines immediately.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
