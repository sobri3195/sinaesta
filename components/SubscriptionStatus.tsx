import React, { useMemo, useState } from 'react';
import { Crown, Calendar, CreditCard, ExternalLink, RefreshCw } from 'lucide-react';
import { useInvoices, useMySubscription } from '../hooks/useBilling';
import { billingEndpoints } from '../services/endpoints/billingEndpoints';
import InvoiceList from './InvoiceList';
import PaymentMethod from './PaymentMethod';

interface SubscriptionStatusProps {
  onUpgrade: () => void;
}

const fmtDate = (value?: any) => {
  if (!value) return null;
  const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date);
};

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ onUpgrade }) => {
  const { data: sub, isLoading, refetch } = useMySubscription({ enabled: true });
  const { data: invoices, isLoading: invoicesLoading, refetch: refetchInvoices } = useInvoices({ enabled: true });

  const [isPortalLoading, setIsPortalLoading] = useState(false);

  const nextBilling = useMemo(() => {
    const next = sub?.currentPeriodEnd;
    return fmtDate(next);
  }, [sub?.currentPeriodEnd]);

  const openPortal = async () => {
    setIsPortalLoading(true);
    try {
      const { url } = await billingEndpoints.createPortalSession();
      window.location.href = url;
    } finally {
      setIsPortalLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Subscription</h1>
            <p className="text-gray-600">Kelola paket, metode pembayaran, dan invoice.</p>
          </div>
          <button
            onClick={async () => {
              await refetch();
              await refetchInvoices();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 font-bold text-gray-700"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          {isLoading && <div className="text-gray-600">Memuat status subscription...</div>}

          {!isLoading && sub && (
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <Crown size={20} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Current plan</div>
                    <div className="text-xl font-black text-gray-900">{sub.plan.name}</div>
                    <div className="text-xs text-gray-500">Status: {sub.status}</div>
                  </div>
                </div>

                {nextBilling && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-700">
                    <Calendar size={16} className="text-gray-400" />
                    Next billing: <span className="font-bold">{nextBilling}</span>
                  </div>
                )}

                <div className="mt-4">
                  <div className="text-sm font-bold text-gray-900 mb-2">Included features</div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                    {(sub.plan.features || []).map((f, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="w-full md:w-64 space-y-3">
                <button
                  onClick={onUpgrade}
                  className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-indigo-700"
                >
                  Upgrade plan
                </button>
                <button
                  onClick={openPortal}
                  disabled={isPortalLoading}
                  className="w-full bg-white border border-gray-200 text-gray-800 px-4 py-2.5 rounded-lg font-bold hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CreditCard size={16} /> Manage billing <ExternalLink size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        <PaymentMethod />

        <InvoiceList invoices={invoices || []} isLoading={invoicesLoading} />
      </div>
    </div>
  );
};

export default SubscriptionStatus;
