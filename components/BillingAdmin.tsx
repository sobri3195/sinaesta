import React, { useMemo, useState } from 'react';
import { DollarSign, Users, AlertTriangle, TicketPercent, RefreshCw } from 'lucide-react';
import {
  useBillingAdminCoupons,
  useBillingAdminOverview,
  useBillingAdminPayments,
  useBillingAdminSubscriptions,
} from '../hooks/useBilling';
import { billingEndpoints } from '../services/endpoints/billingEndpoints';

const formatMoney = (amount: number) => {
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} IDR`;
  }
};

const BillingAdmin: React.FC = () => {
  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useBillingAdminOverview({ enabled: true });
  const { data: subs, isLoading: subsLoading, refetch: refetchSubs } = useBillingAdminSubscriptions({ enabled: true });
  const { data: payments, isLoading: paymentsLoading, refetch: refetchPayments } = useBillingAdminPayments({ enabled: true });
  const { data: coupons, isLoading: couponsLoading, refetch: refetchCoupons } = useBillingAdminCoupons({ enabled: true });

  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponPercent, setNewCouponPercent] = useState<number>(10);

  const activeSubsCount = overview?.activeSubscriptions || 0;
  const pastDueCount = overview?.pastDueSubscriptions || 0;

  const totals = useMemo(() => {
    return {
      totalPayments: payments?.length || 0,
      totalSubs: subs?.length || 0,
    };
  }, [payments, subs]);

  const refreshAll = async () => {
    await Promise.all([refetchOverview(), refetchSubs(), refetchPayments(), refetchCoupons()]);
  };

  const createCoupon = async () => {
    const code = newCouponCode.trim().toUpperCase();
    if (!code) return;
    await billingEndpoints.adminCreateCoupon({ code, percentOff: newCouponPercent, currency: 'idr' });
    setNewCouponCode('');
    await refetchCoupons();
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Billing Admin</h1>
            <p className="text-gray-600">Revenue, subscriptions, payments, coupons.</p>
          </div>
          <button
            onClick={refreshAll}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 font-bold text-gray-700"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <DollarSign size={18} />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-bold">Revenue (month)</div>
                <div className="text-lg font-black text-gray-900">{overviewLoading ? '…' : formatMoney(overview?.revenueThisMonth || 0)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <DollarSign size={18} />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-bold">Revenue (total)</div>
                <div className="text-lg font-black text-gray-900">{overviewLoading ? '…' : formatMoney(overview?.revenueTotal || 0)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Users size={18} />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-bold">Active subscriptions</div>
                <div className="text-lg font-black text-gray-900">{overviewLoading ? '…' : activeSubsCount}</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <AlertTriangle size={18} />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-bold">Past due</div>
                <div className="text-lg font-black text-gray-900">{overviewLoading ? '…' : pastDueCount}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-black text-gray-900 mb-4">Coupons</h2>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={newCouponCode}
              onChange={(e) => setNewCouponCode(e.target.value)}
              placeholder="CODE (e.g. PPDS10)"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              value={newCouponPercent}
              onChange={(e) => setNewCouponPercent(Number(e.target.value))}
              min={1}
              max={100}
              className="w-full md:w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={createCoupon}
              className="bg-gray-900 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-black flex items-center justify-center gap-2"
            >
              <TicketPercent size={16} /> Create
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-700">
            {couponsLoading ? 'Memuat coupons…' : `Total coupons: ${coupons?.length || 0}`}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm overflow-x-auto">
            <h2 className="text-lg font-black text-gray-900">Subscriptions</h2>
            <div className="text-xs text-gray-500 mt-1">{subsLoading ? 'Memuat…' : `${totals.totalSubs} rows`}</div>
            {!subsLoading && subs && (
              <table className="min-w-full text-sm mt-4">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2 pr-3">User</th>
                    <th className="py-2 pr-3">Plan</th>
                    <th className="py-2 pr-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subs.slice(0, 20).map((s) => (
                    <tr key={s.id}>
                      <td className="py-3 pr-3">
                        <div className="font-bold text-gray-900">{s.name}</div>
                        <div className="text-xs text-gray-500">{s.email}</div>
                      </td>
                      <td className="py-3 pr-3">{s.plan_code}</td>
                      <td className="py-3 pr-3">{s.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm overflow-x-auto">
            <h2 className="text-lg font-black text-gray-900">Payments</h2>
            <div className="text-xs text-gray-500 mt-1">{paymentsLoading ? 'Memuat…' : `${totals.totalPayments} rows`}</div>
            {!paymentsLoading && payments && (
              <table className="min-w-full text-sm mt-4">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2 pr-3">User</th>
                    <th className="py-2 pr-3">Amount</th>
                    <th className="py-2 pr-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.slice(0, 20).map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 pr-3">
                        <div className="font-bold text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.email}</div>
                      </td>
                      <td className="py-3 pr-3">{formatMoney(p.amount)}</td>
                      <td className="py-3 pr-3">{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Catatan: Refund & manual assignment tersedia via API (billing/admin/*). Untuk operasi sensitif, pastikan audit logging aktif.
        </p>
      </div>
    </div>
  );
};

export default BillingAdmin;
