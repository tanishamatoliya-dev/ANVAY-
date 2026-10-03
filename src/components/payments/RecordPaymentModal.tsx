import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../api/axiosInstance';
import { CheckCircle2, Receipt, DollarSign } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  therapistId: string;
  onPaymentRecorded: () => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  therapistId,
  onPaymentRecorded,
}) => {
  const [clients, setClients] = useState<any[]>([]);
  const [clientId, setClientId] = useState('');
  const [amount, setAmount] = useState(180);
  const [description, setDescription] = useState('Individual Psychotherapy Session');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get('/clients').then((res: any) => {
        setClients(res || []);
        if (res && res.length > 0 && !clientId) {
          setClientId(res[0]._id || res[0].id);
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await api.post('/payments/record-direct', {
        therapistId,
        clientId,
        amount: Number(amount),
        currency: 'USD',
        description,
        paymentMethod,
      });

      setSuccess(true);
      onPaymentRecorded();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to record payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Direct Payment & Issue Invoice"
      subtitle="Log direct clinical payments (Cash, Bank Transfer, Insurance, Card) without third-party gateways."
      maxWidth="max-w-md"
    >
      {success ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="font-serif-editorial text-xl font-semibold text-[#1e2321]">
            Invoice Issued & Payment Logged
          </h4>
          <p className="text-xs text-[#59665f]">
            The payment has been added to your ledger and the client file has been updated.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">
              {error}
            </div>
          )}

          <div>
            <label className="block font-semibold text-[#1e2321] mb-1">
              Client File *
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
            >
              {clients.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1e2321] mb-1">
                Amount ($ USD) *
              </label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-[#cfcbc0] rounded font-mono text-[#1e2321]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1e2321] mb-1">
                Settlement Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
              >
                <option value="Bank Transfer / Zelle / Wire">Bank Transfer / Wire</option>
                <option value="In-Clinic Cash / Check">Cash / Check</option>
                <option value="Direct Card / Terminal">Direct Card Terminal</option>
                <option value="Insurance Superbill Reimbursed">Insurance Reimbursement</option>
                <option value="Complimentary Consultation">Complimentary / Waived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#1e2321] mb-1">
              Description / Clinical Service
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Individual Psychotherapy (50 min)"
              className="w-full px-3 py-2 bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
            />
          </div>

          <div className="pt-3 border-t border-[#eeebe3] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#4d5a52] hover:bg-[#f2efe6] rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#1e2321] hover:bg-[#2b3530] disabled:opacity-50 rounded shadow-xs"
            >
              {loading ? 'Recording...' : 'Record Payment & Issue Invoice'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
