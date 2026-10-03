import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-[#e7e5dc] bg-[#fdfdfc] text-[#5e6963] py-8 px-4 md:px-8 mt-auto text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded bg-[#1e2321] text-white flex items-center justify-center font-serif text-xs font-bold">
            U
          </div>
          <div>
            <span className="font-serif-editorial text-sm font-semibold text-[#1e2321] tracking-wide">
              UNLOX
            </span>
            <span className="text-[11px] text-[#78837c] ml-2">
              Practice Management Architecture for Independent Therapists
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-[11px]">
          <button
            onClick={() => onNavigate && onNavigate('privacy-policy')}
            className="hover:text-[#1e2321] transition-colors"
          >
            Privacy Policy
          </button>
          <span className="text-[#d8d4c7]">•</span>
          <button
            onClick={() => onNavigate && onNavigate('terms-and-conditions')}
            className="hover:text-[#1e2321] transition-colors"
          >
            Terms & Conditions
          </button>
          <span className="text-[#d8d4c7]">•</span>
          <span className="inline-flex items-center gap-1 text-[#46534a]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Encrypted Data Separation</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
