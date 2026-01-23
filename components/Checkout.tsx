import React, { useMemo, useState } from 'react';
import { ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import type { BillingPlan } from '../types/api';
import { billingEndpoints } from '../services/endpoints/billingEndpoints';

interface CheckoutProps {
  plan: BillingPlan;
  onCancel: () => void;
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

const Checkout: React.FC<CheckoutProps> = ({ plan, onCancel }) => {
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderSummary = useMemo(() => {
    return {
      name: plan.name,
      price: formatPrice(plan.price_amount, plan.currency),
      interval: plan.price_amount > 0 ? `/${plan.interval}` : '',
      trial: plan.trial_days > 0 && plan.price_amount > 0 ? `${plan.trial_days} hari trial` : null,
    };
  }, [plan]);

  const startCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { url } = await billingEndpoints.createCheckoutSession({
        planId: plan.id,
        couponCode: couponCode.trim() ? couponCode.trim() : undefined,
      });

      window.location.href = url;
    } catch (e: any) {
      setError(e?.message || 'Gagal memulai checkout. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Checkout</h1>
              <p className="text-gray-600 mt-1">Review pesanan Anda sebelum melanjutkan pembayaran.</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold">
              <ShieldCheck size={16} /> Secure
            </div>
          </div>

          <div className="mt-6 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-gray-900">{orderSummary.name}</div>
                <div className="text-xs text-gray-500">{plan.code}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-gray-900">
                  {orderSummary.price}
                  <span className="text-sm font-bold text-gray-500">{orderSummary.interval}</span>
                </div>
                {orderSummary.trial && (
                  <div className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full inline-block">
                    {orderSummary.trial}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-bold text-gray-900 mb-2">Kode Promo (opsional)</label>
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Masukkan kode promo"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              <AlertTriangle size={18} className="mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 bg-white border border-gray-200 text-gray-800 px-4 py-2.5 rounded-lg font-bold hover:bg-gray-50 transition"
            >
              Kembali
            </button>
            <button
              onClick={startCheckout}
              disabled={isLoading || plan.price_amount === 0}
              className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Mengalihkan…' : 'Bayar Aman'} <ArrowRight size={18} />
            </button>
          </div>

          {plan.price_amount === 0 && (
            <p className="text-xs text-gray-500 mt-4">
              Free plan tidak memerlukan pembayaran. Silakan kembali dan pilih fitur yang ingin Anda buka.
            </p>
          )}

          <p className="text-xs text-gray-500 mt-4">
            Pembayaran kartu menggunakan 3D Secure saat diperlukan. Retry untuk pembayaran gagal ditangani otomatis oleh Stripe.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
