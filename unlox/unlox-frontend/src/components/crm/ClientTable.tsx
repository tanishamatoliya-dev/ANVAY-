import React, { useState } from 'react';
import { Search, ChevronRight, Mail, Phone, Filter } from 'lucide-react';

interface ClientTableProps {
  clients: any[];
  onSelectClient: (client: any) => void;
  onOpenAddModal: () => void;
}

export const ClientTable: React.FC<ClientTableProps> = ({
  clients,
  onSelectClient,
  onOpenAddModal,
}) => {
  const [search, setSearch] = useState('');
  const [intakeFilter, setIntakeFilter] = useState<'all' | 'pending' | 'submitted' | 'reviewed'>('all');

  const filtered = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.tags && c.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase())));
    const matchesIntake = intakeFilter === 'all' || c.intakeStatus === intakeFilter;
    return matchesSearch && matchesIntake;
  });

  return (
    <div className="bg-[#fdfdfc] border border-[#e2dfd5] rounded shadow-xs overflow-hidden">
      {/* Search & Filter Toolbar */}
      <div className="p-4 border-b border-[#e7e5dc] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#faf9f6]">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-[#727d76] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clients by name, email, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#d6d2c6] rounded text-[#1e2321] focus:border-[#38483e] focus:ring-1 focus:ring-[#38483e]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 text-xs text-[#525f57]">
            <Filter className="w-3.5 h-3.5 text-[#727d76]" />
            <span>Intake:</span>
            <select
              value={intakeFilter}
              onChange={(e: any) => setIntakeFilter(e.target.value)}
              className="py-1 px-2.5 text-xs bg-white border border-[#d6d2c6] rounded text-[#1e2321]"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>

          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#1e2321] hover:bg-[#2b3530] rounded shadow-xs transition-colors shrink-0"
          >
            + Add Client
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#e7e5dc] bg-[#f5f3ec] text-[#637068] font-semibold">
              <th className="py-3 px-4">Client Name</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Intake Status</th>
              <th className="py-3 px-4">Tags</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">File</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eeebe3]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-[#717b75]">
                  {search ? 'No clients match your search criteria.' : 'No clients registered yet.'}
                </td>
              </tr>
            ) : (
              filtered.map((client) => (
                <tr
                  key={client._id || client.id}
                  onClick={() => onSelectClient(client)}
                  className="hover:bg-[#f6f5ee] transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-semibold text-[#1e2321]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#e8e5db] text-[#344038] flex items-center justify-center font-serif font-bold text-xs">
                        {client.name.charAt(0)}
                      </div>
                      <span>{client.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#4f5c54]">
                    <div>{client.email}</div>
                    {client.phone && <div className="text-[11px] text-[#717c76]">{client.phone}</div>}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        client.intakeStatus === 'submitted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : client.intakeStatus === 'reviewed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {client.intakeStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {client.tags?.map((t: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded bg-[#f2efe6] border border-[#e2dfd5] text-[10px] text-[#4f5b53]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="capitalize text-[11px] text-[#3c4740]">
                      {client.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#4d5c52] group-hover:text-[#1e2321] group-hover:underline font-medium">
                      View File
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
