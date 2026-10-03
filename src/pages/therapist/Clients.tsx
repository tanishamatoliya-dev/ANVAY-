import React, { useState, useEffect } from 'react';
import { api } from '../../api/axiosInstance';
import { ClientTable } from '../../components/crm/ClientTable';
import { ClientDetailModal } from '../../components/crm/ClientDetailModal';
import { AddClientModal } from '../../components/crm/AddClientModal';
import { useAuth } from '../../context/AuthContext';

interface ClientsPageProps {
  onOpenBookAppointment?: (clientId: string, clientName: string) => void;
  onOpenCreateNote?: (clientId: string) => void;
}

export const ClientsPage: React.FC<ClientsPageProps> = ({
  onOpenBookAppointment,
  onOpenCreateNote,
}) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data: any = await api.get('/clients');
      setClients(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user]);

  const handleSelectClient = (client: any) => {
    setSelectedClientId(client._id || client.id);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e7e5dc] pb-6">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-widest text-[#727f77] block mb-1">
            Directory & Records
          </span>
          <h1 className="font-serif-editorial text-3xl font-medium tracking-tight text-[#1e2321]">
            Client Management
          </h1>
          <p className="text-xs text-[#5e6b63] mt-1">
            Maintain clinical demographics, intake status, and encrypted session records.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-xs font-medium text-white bg-[#1e2321] hover:bg-[#2b3530] rounded shadow-xs"
        >
          + Register Client
        </button>
      </div>

      <ClientTable
        clients={clients}
        onSelectClient={handleSelectClient}
        onOpenAddModal={() => setShowAddModal(true)}
      />

      <ClientDetailModal
        clientId={selectedClientId}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedClientId(null);
        }}
        onClientUpdated={fetchClients}
        onOpenBookAppointment={onOpenBookAppointment}
        onOpenCreateNote={onOpenCreateNote}
      />

      <AddClientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onClientAdded={fetchClients}
      />
    </div>
  );
};
