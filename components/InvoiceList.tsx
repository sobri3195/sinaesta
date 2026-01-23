import React from 'react';
import { Download, FileText } from 'lucide-react';
import type { BillingInvoice } from '../types/api';

interface InvoiceListProps {
  invoices: BillingInvoice[];
  isLoading?: boolean;
}

const formatMoney = (amount?: number | null, currency?: string | null) => {
  if (amount === null || amount === undefined) return '-';
  const cur = (currency || 'idr').toUpperCase();
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: cur,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${cur}`;
  }
};

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, isLoading }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-gray-900">Invoice history</h2>
        <div className="text-xs text-gray-500">{invoices.length} invoices</div>
      </div>

      {isLoading && <div className="mt-4 text-gray-600">Memuat invoice…</div>}

      {!isLoading && invoices.length === 0 && (
        <div className="mt-4 text-gray-600">Belum ada invoice.</div>
      )}

      {!isLoading && invoices.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 pr-4">Invoice</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((inv) => {
                const url = inv.pdf_url || inv.hosted_invoice_url;
                return (
                  <tr key={inv.id} className="text-gray-800">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-gray-400" />
                        <span className="font-bold">{inv.invoice_number || inv.stripe_invoice_id || inv.id}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {inv.status || '-'}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {formatMoney(inv.amount_paid ?? inv.amount_due, inv.currency)}
                    </td>
                    <td className="py-3 pr-4">
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-indigo-700 font-bold hover:underline"
                        >
                          <Download size={16} /> PDF
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Invoice PDF disediakan oleh Stripe dan dapat berisi rincian pajak sesuai konfigurasi.
      </p>
    </div>
  );
};

export default InvoiceList;
