import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../api/axiosInstance';
import { useEntitlement } from '../../hooks/useEntitlement';
import { AlertCircle } from 'lucide-react';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientAdded: () => void;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onClientAdded,
}) => {
  const { entitlements, isClientLimitReached } = useEntitlement();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [tags, setTags] = useState('Individual Therapy');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.post('/clients', {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        notes: notes.trim() || undefined,
      });

      onClientAdded();
      onClose();
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setDateOfBirth('');
      setNotes('');
    } catch (err: any) {
      setError(err.message || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Client"
      subtitle="Register an active client record in your clinical directory."
      maxWidth="max-w-lg"
    >
      {isClientLimitReached && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
          <div>
            <span className="font-semibold block">Client limit reached</span>
            <span>
              Your {entitlements?.planName} allows up to {entitlements?.limits.maxClients} clients.
              Upgrade your tier to register additional clients.
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#1e2321] mb-1">
            Full Legal or Preferred Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Julian Ross"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321] focus:border-[#44564b] focus:ring-1 focus:ring-[#44564b]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#1e2321] mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="julian@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321] focus:border-[#44564b] focus:ring-1 focus:ring-[#44564b]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1e2321] mb-1">
              Contact Phone
            </label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321] focus:border-[#44564b] focus:ring-1 focus:ring-[#44564b]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#1e2321] mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321] focus:border-[#44564b] focus:ring-1 focus:ring-[#44564b]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1e2321] mb-1">
              Clinical Tags (Comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. CBT, Anxiety, Bi-weekly"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321] focus:border-[#44564b] focus:ring-1 focus:ring-[#44564b]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1e2321] mb-1">
            Confidential Therapist Initial Notes
          </label>
          <textarea
            rows={3}
            placeholder="Private background context or referral information (never exposed to client)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321] focus:border-[#44564b] focus:ring-1 focus:ring-[#44564b]"
          />
        </div>

        <div className="pt-3 border-t border-[#e7e5dc] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-[#48534d] hover:bg-[#f0ece2] rounded transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || isClientLimitReached}
            className="px-4 py-2 text-xs font-medium text-white bg-[#1e2321] hover:bg-[#2e3732] disabled:opacity-50 rounded transition-colors shadow-xs"
          >
            {loading ? 'Registering...' : 'Add Client to Directory'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
