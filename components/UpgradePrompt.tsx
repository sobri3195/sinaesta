import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';

interface UpgradePromptProps {
  title: string;
  description: string;
  ctaLabel?: string;
  onUpgrade: () => void;
  onBack?: () => void;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  title,
  description,
  ctaLabel = 'Upgrade',
  onUpgrade,
  onBack,
}) => {
  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
          <Lock size={22} />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600 mt-2">{description}</p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onUpgrade}
            className="flex-1 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            {ctaLabel} <ArrowRight size={18} />
          </button>
          {onBack && (
            <button
              onClick={onBack}
              className="flex-1 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-bold hover:bg-gray-50 transition"
            >
              Kembali
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Pembayaran diproses secara aman melalui Stripe. Sinaesta tidak pernah menyimpan nomor kartu Anda.
        </p>
      </div>
    </div>
  );
};

export default UpgradePrompt;
