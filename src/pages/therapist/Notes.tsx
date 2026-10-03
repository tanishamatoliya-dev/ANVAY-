import React, { useState, useEffect } from 'react';
import { api } from '../../api/axiosInstance';
import { NoteList } from '../../components/notes/NoteList';
import { NoteEditor } from '../../components/notes/NoteEditor';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, PlusCircle } from 'lucide-react';

interface NotesPageProps {
  onOpenAIModal?: () => void;
  preselectedClientId?: string;
}

export const NotesPage: React.FC<NotesPageProps> = ({
  onOpenAIModal,
  preselectedClientId,
}) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<any | null>(null);

  const fetchNotesAndClients = async () => {
    try {
      const [n, c]: any = await Promise.all([
        api.get('/notes'),
        api.get('/clients'),
      ]);
      setNotes(n || []);
      setClients(c || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotesAndClients();
    if (preselectedClientId) {
      setIsEditing(true);
    }
  }, [user, preselectedClientId]);

  const handleEditNote = (note: any) => {
    setNoteToEdit(note);
    setIsEditing(true);
  };

  const handleNewNote = () => {
    setNoteToEdit(null);
    setIsEditing(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e7e5dc] pb-6">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-widest text-[#727f77] block mb-1">
            Clinical Documentation
          </span>
          <h1 className="font-serif-editorial text-3xl font-medium tracking-tight text-[#1e2321]">
            Encrypted Session Notes
          </h1>
          <p className="text-xs text-[#5e6b63] mt-1">
            Private, therapist-only SOAP records compliant with clinical record-keeping standards.
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={handleNewNote}
            className="px-4 py-2 text-xs font-medium text-white bg-[#1e2321] hover:bg-[#2e3732] rounded shadow-xs"
          >
            + New SOAP Record
          </button>
        )}
      </div>

      {isEditing ? (
        <NoteEditor
          noteToEdit={noteToEdit}
          defaultClientId={preselectedClientId}
          onSaved={() => {
            setIsEditing(false);
            setNoteToEdit(null);
            fetchNotesAndClients();
          }}
          onCancel={() => {
            setIsEditing(false);
            setNoteToEdit(null);
          }}
          onOpenAIModal={onOpenAIModal}
        />
      ) : (
        <NoteList
          notes={notes}
          clients={clients}
          onSelectNoteToEdit={handleEditNote}
          onRefresh={fetchNotesAndClients}
          onOpenNewNote={handleNewNote}
        />
      )}
    </div>
  );
};
