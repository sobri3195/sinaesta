import React, { useMemo } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import type { BillingPlan, BillingPlanCode } from '../types/api';
import { useBillingPlans } from '../hooks/useBilling';

interface PricingProps {
  currentPlanCode?: BillingPlanCode | null;
  embedded?: boolean;
  onSelectPlan?: (plan: BillingPlan) => void;
}

const formatPrice = (amount: number, currency: string) => {
  if (amount === 0) return 'Gratis';
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency.toUpperCase()}`;
  }
};

const planOrder: BillingPlanCode[] = ['FREE', 'PREMIUM', 'PROFESSIONAL'];

const Pricing: React.FC<PricingProps> = ({ currentPlanCode, embedded = false, onSelectPlan }) => {
  const { data: plans, isLoading, isError } = useBillingPlans({ enabled: true });

  const sortedPlans = useMemo(() => {
    const list = plans || [];
    const byCode = new Map(list.map((p) => [p.code, p] as const));
    const ordered = planOrder.map((c) => byCode.get(c)).filter(Boolean) as BillingPlan[];
    const extras = list.filter((p) => !planOrder.includes(p.code));
    return [...ordered, ...extras];
  }, [plans]);

  return (
    <div className={embedded ? '' : 'p-4 sm:p-6 lg:p-8'}>
      {!embedded && (
        <div className="max-w-5xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-4">
            <Sparkles size={16} className="text-indigo-600" />
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Paket Berlangganan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900">Pilih Paket yang Cocok</h1>
          <p className="text-gray-600 mt-2">Upgrade kapan saja. Semua pembayaran diproses aman via Stripe.</p>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {isLoading && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-600">Memuat paket...</div>
        )}

        {isError && (
          <div className="bg-white border border-red-200 rounded-xl p-6 text-red-700">Gagal memuat paket.</div>
        )}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {sortedPlans.map((plan) => {
              const isCurrent = currentPlanCode && plan.code === currentPlanCode;
              const highlighted = plan.code === 'PREMIUM';

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white border rounded-2xl shadow-sm p-6 flex flex-col ${highlighted ? 'border-indigo-300 ring-1 ring-indigo-100' : 'border-gray-200'}`}
                >
                  {highlighted && (
                    <div className="absolute -top-3 left-6 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-500">{plan.code}</p>
                    </div>
                    {isCurrent && (
                      <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full">
                        Aktif
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="text-3xl font-black text-gray-900">
                      {formatPrice(plan.price_amount, plan.currency)}
                      {plan.price_amount > 0 && (
                        <span className="text-base font-bold text-gray-500">/{plan.interval}</span>
                      )}
                    </div>
                    {plan.trial_days > 0 && plan.price_amount > 0 && (
                      <p className="text-xs text-gray-500 mt-1">Termasuk trial {plan.trial_days} hari</p>
                    )}
                  </div>

                  <ul className="mt-5 space-y-2 text-sm text-gray-700 flex-1">
                    {(plan.features || []).map((f, idx) => (
                      <li key={`${plan.id}-f-${idx}`} className="flex items-start gap-2">
                        <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <button
                      onClick={() => onSelectPlan?.(plan)}
                      disabled={!onSelectPlan || isCurrent}
                      className={`w-full px-4 py-2.5 rounded-lg font-bold transition ${
                        isCurrent
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : highlighted
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-gray-900 text-white hover:bg-black'
                      }`}
                    >
                      {isCurrent ? 'Paket Aktif' : plan.code === 'FREE' ? 'Mulai Gratis' : 'Upgrade'}
                    </button>
                  </div>

                  <p className="text-[11px] text-gray-500 mt-3">
                    Input kartu & 3D Secure ditangani Stripe (PCI compliant). Sinaesta tidak menyimpan data kartu.
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;
