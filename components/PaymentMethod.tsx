import React, { useState } from 'react';
import { CreditCard, ExternalLink } from 'lucide-react';
import { billingEndpoints } from '../services/endpoints/billingEndpoints';

const PaymentMethod: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const openPortal = async () => {
    setIsLoading(true);
    try {
      const { url } = await billingEndpoints.createPortalSession();
      window.location.href = url;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-gray-900">Payment methods</h2>
          <p className="text-sm text-gray-600">Kelola kartu, metode pembayaran, dan pembatalan melalui portal aman.</p>
        </div>
        <button
          onClick={openPortal}
          disabled={isLoading}
          className="bg-white border border-gray-200 text-gray-800 px-4 py-2.5 rounded-lg font-bold hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
        >
          <CreditCard size={16} /> Open portal <ExternalLink size={16} />
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Untuk kepatuhan PCI, input kartu ditangani Stripe. Sinaesta tidak menyimpan nomor kartu, CVV, maupun data sensitif.
      </p>
    </div>
  );
};

export default PaymentMethod;
