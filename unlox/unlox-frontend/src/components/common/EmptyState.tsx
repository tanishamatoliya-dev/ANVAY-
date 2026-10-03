import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="border border-dashed border-[#dcd7cb] bg-[#faf9f6] rounded p-8 md:p-12 text-center max-w-lg mx-auto my-6">
      {Icon && (
        <div className="w-10 h-10 rounded bg-[#f0ece2] border border-[#ded8cb] flex items-center justify-center mx-auto mb-3.5 text-[#4a584f]">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h3 className="font-serif-editorial text-lg font-semibold text-[#1e2321] tracking-tight">
        {title}
      </h3>
      <p className="text-xs text-[#636f68] mt-1.5 leading-relaxed max-w-sm mx-auto">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 text-xs font-medium text-white bg-[#1e2321] hover:bg-[#2b3530] rounded shadow-xs transition-colors inline-block"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
