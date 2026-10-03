import React, { useState } from 'react';
import { Search, Lock, Edit3, Trash2, Calendar, FileText } from 'lucide-react';
import { api } from '../../api/axiosInstance';

interface NoteListProps {
  notes: any[];
  clients: any[];
  onSelectNoteToEdit: (note: any) => void;
  onRefresh: () => void;
  onOpenNewNote: () => void;
}

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  clients,
  onSelectNoteToEdit,
  onRefresh,
  onOpenNewNote,
}) => {
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('all');

  const filtered = notes.filter((n) => {
    const matchesClient = clientFilter === 'all' || n.clientId === clientFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      n.title.toLowerCase().includes(q) ||
      (n.subjective && n.subjective.toLowerCase().includes(q)) ||
      (n.assessment && n.assessment.toLowerCase().includes(q));
    return matchesClient && matchesSearch;
  });

  const handleDelete = async (id: string, isLocked: boolean) => {
    if (isLocked) {
      alert('Locked notes cannot be deleted to preserve clinical compliance.');
      return;
    }
    if (!confirm('Are you sure you want to permanently delete this clinical session note?')) {
      return;
    }
    try {
      await api.delete(`/notes/${id}`);
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Failed to delete note');
    }
  };

  const getClientName = (clientId: string) => {
    const found = clients.find((c) => (c._id || c.id) === clientId);
    return found?.name || 'Client';
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#faf9f6] p-3.5 border border-[#e2dfd5] rounded">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#76807a] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notes content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#d6d2c6] rounded text-[#1e2321]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-[#d6d2c6] rounded text-[#1e2321]"
          >
            <option value="all">All Clients</option>
            {clients.map((c) => (
              <option key={c._id || c.id} value={c._id || c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenNewNote}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#1e2321] hover:bg-[#2b3530] rounded shadow-xs"
          >
            + New Session Note
          </button>
        </div>
      </div>

      {/* Note Cards */}
      {filtered.length === 0 ? (
        <div className="p-12 border border-dashed border-[#dcd7cb] rounded text-center text-xs text-[#717b75]">
          No clinical session notes recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((note) => (
            <div
              key={note._id || note.id}
              className="bg-[#fdfdfc] border border-[#e2dfd5] rounded p-5 shadow-xs hover:border-[#cbc6b8] transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3 border-b border-[#f0ede4] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif-editorial text-base sm:text-lg font-semibold text-[#1e2321]">
                      {note.title}
                    </span>
                    {note.isLocked && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#637068] mt-1">
                    <span className="font-semibold text-[#2d3831]">{getClientName(note.clientId)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#79857e]" />
                      <span>{note.sessionDate}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectNoteToEdit(note)}
                    className="p-1.5 text-[#525f57] hover:text-[#1e2321] hover:bg-[#f2efe6] rounded transition-colors"
                    title="Edit Note"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  {!note.isLocked && (
                    <button
                      onClick={() => handleDelete(note._id || note.id, note.isLocked)}
                      className="p-1.5 text-[#738078] hover:text-[#991b1b] hover:bg-[#fbeaea] rounded transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* SOAP Excerpt */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {note.subjective && (
                  <div className="p-3 bg-[#faf9f6] border border-[#eeebe3] rounded">
                    <span className="font-bold text-[#35433a] block mb-0.5">Subjective:</span>
                    <p className="text-[#556259] leading-relaxed line-clamp-3">{note.subjective}</p>
                  </div>
                )}
                {note.assessment && (
                  <div className="p-3 bg-[#faf9f6] border border-[#eeebe3] rounded">
                    <span className="font-bold text-[#35433a] block mb-0.5">Assessment:</span>
                    <p className="text-[#556259] leading-relaxed line-clamp-3">{note.assessment}</p>
                  </div>
                )}
                {note.plan && (
                  <div className="p-3 bg-[#faf9f6] border border-[#eeebe3] rounded md:col-span-2">
                    <span className="font-bold text-[#35433a] block mb-0.5">Plan:</span>
                    <p className="text-[#556259] leading-relaxed line-clamp-2">{note.plan}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
