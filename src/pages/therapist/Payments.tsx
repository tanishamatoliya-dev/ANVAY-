import React, { useState, useEffect } from 'react';
import { api } from '../../api/axiosInstance';
import { InvoiceTable } from '../../components/payments/InvoiceTable';
import { RecordPaymentModal } from '../../components/payments/RecordPaymentModal';
import { useAuth } from '../../context/AuthContext';
import { Receipt, DollarSign, ShieldCheck, CheckCircle2, Plus } from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const { user, therapist } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPaymentsAndInvoices = async () => {
    try {
      setLoading(true);
      const [payRes, invRes]: any = await Promise.all([
        api.get('/payments'),
        api.get('/invoices'),
      ]);
      setPayments(payRes.payments || []);
      setInvoices(invRes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsAndInvoices();
  }, [user]);

  const settledTotal = payments
    .filter((p) => p.status === 'captured')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e7e5dc] pb-6">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-widest text-[#727f77] block mb-1">
            Financial Ledger
          </span>
          <h1 className="font-serif-editorial text-3xl font-medium tracking-tight text-[#1e2321]">
            Billing & Invoices
          </h1>
          <p className="text-xs text-[#5e6b63] mt-1">
            Direct practice invoicing and payment tracking for your clinical sessions.
          </p>
        </div>

        <button
          onClick={() => setShowRecordModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1e2321] hover:bg-[#2b3530] rounded shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Payment / Issue Invoice</span>
        </button>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#fdfdfc] border border-[#e2dfd5] rounded">
          <span className="text-[10px] uppercase tracking-wider text-[#6d7972] font-semibold block mb-1">
            Settled Revenue
          </span>
          <span className="font-serif text-2xl font-bold text-[#1e2321] block">
            ${settledTotal.toLocaleString()} USD
          </span>
          <span className="text-[10px] text-[#7d8781] mt-1 block">
            Collected patient fees
          </span>
        </div>

        <div className="p-4 bg-[#fdfdfc] border border-[#e2dfd5] rounded">
          <span className="text-[10px] uppercase tracking-wider text-[#6d7972] font-semibold block mb-1">
            Generated Invoices
          </span>
          <span className="font-serif text-2xl font-bold text-[#1e2321] block">
            {invoices.length}
          </span>
          <span className="text-[10px] text-[#7d8781] mt-1 block">
            Itemized clinical receipts
          </span>
        </div>

        <div className="p-4 bg-[#fdfdfc] border border-[#e2dfd5] rounded">
          <span className="text-[10px] uppercase tracking-wider text-[#6d7972] font-semibold block mb-1">
            Billing Mode
          </span>
          <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Direct Practice Billing</span>
          </div>
          <span className="text-[10px] text-[#7d8781] mt-1 block">
            Bank transfer, card, cash, or insurance
          </span>
        </div>
      </div>

      {/* Invoices List */}
      <InvoiceTable invoices={invoices} />

      {/* Record Direct Payment Modal */}
      {therapist && (
        <RecordPaymentModal
          isOpen={showRecordModal}
          onClose={() => setShowRecordModal(false)}
          therapistId={therapist.id}
          onPaymentRecorded={fetchPaymentsAndInvoices}
        />
      )}
    </div>
  );
};
