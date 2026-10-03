import React, { useState, useEffect } from 'react';
import { api } from '../../api/axiosInstance';
import { Lock, Unlock, Sparkles, Save, ShieldCheck } from 'lucide-react';
import { useEntitlement } from '../../hooks/useEntitlement';

interface NoteEditorProps {
  noteToEdit?: any | null;
  defaultClientId?: string;
  onSaved: () => void;
  onCancel: () => void;
  onOpenAIModal?: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  noteToEdit,
  defaultClientId,
  onSaved,
  onCancel,
  onOpenAIModal,
}) => {
  const { canAccess } = useEntitlement();
  const [clients, setClients] = useState<any[]>([]);
  const [clientId, setClientId] = useState(noteToEdit?.clientId || defaultClientId || '');
  const [title, setTitle] = useState(noteToEdit?.title || 'Session SOAP Note');
  const [sessionDate, setSessionDate] = useState(
    noteToEdit?.sessionDate || new Date().toISOString().split('T')[0]
  );
  const [subjective, setSubjective] = useState(noteToEdit?.subjective || '');
  const [objective, setObjective] = useState(noteToEdit?.objective || '');
  const [assessment, setAssessment] = useState(noteToEdit?.assessment || '');
  const [plan, setPlan] = useState(noteToEdit?.plan || '');
  const [generalNotes, setGeneralNotes] = useState(noteToEdit?.generalNotes || '');
  const [isLocked, setIsLocked] = useState(Boolean(noteToEdit?.isLocked));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/clients').then((res: any) => {
      setClients(res || []);
      if (!clientId && res && res.length > 0) {
        setClientId(res[0]._id || res[0].id);
      }
    }).catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setError('Please select a client for this note.');
      return;
    }
    if (!title.trim()) {
      setError('Note title is required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const payload = {
        clientId,
        sessionDate,
        title: title.trim(),
        subjective: subjective.trim(),
        objective: objective.trim(),
        assessment: assessment.trim(),
        plan: plan.trim(),
        generalNotes: generalNotes.trim(),
        isLocked,
      };

      if (noteToEdit) {
        await api.put(`/notes/${noteToEdit._id || noteToEdit.id}`, payload);
      } else {
        await api.post('/notes', payload);
      }

      onSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to save clinical note.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fdfdfc] border border-[#e2dfd5] rounded p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#eeebe3] pb-4">
        <div>
          <h3 className="font-serif-editorial text-xl font-semibold text-[#1e2321]">
            {noteToEdit ? 'Edit Clinical Session Record' : 'Record New SOAP Session Note'}
          </h3>
          <p className="text-xs text-[#637068] mt-0.5">
            Encrypted clinical documentation strictly confidential to the therapist.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAIModal && canAccess('aiAssistant') && (
            <button
              type="button"
              onClick={onOpenAIModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2d3a31] bg-[#f2efe6] hover:bg-[#eae5d8] border border-[#d8d3c5] rounded transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#3b5242]" />
              <span>AI SOAP Assistant</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsLocked(!isLocked)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
              isLocked
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-[#4f5b53] border-[#d8d3c5] hover:bg-[#f6f5ee]'
            }`}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{isLocked ? 'Note Locked' : 'Unlocked (Editable)'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#1e2321] mb-1">
              Client File *
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
            >
              {clients.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1e2321] mb-1">
              Session Date *
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1e2321] mb-1">
              Note Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Session 04: Interpersonal Patterns"
              className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
            />
          </div>
        </div>

        {/* Structured SOAP Sections */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-[#2a362f] mb-1">
              [S] Subjective: Client Reported Experiences & Symptoms
            </label>
            <textarea
              rows={2}
              value={subjective}
              onChange={(e) => setSubjective(e.target.value)}
              placeholder="Client statements regarding weekly affect, situational stressors, sleep patterns, distress ratings..."
              className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321] font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2a362f] mb-1">
              [O] Objective: Clinical Observations & Affect
            </label>
            <textarea
              rows={2}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Mental status observations: presentation, speech rate, orientation, thought process, congruency of affect..."
              className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321] font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2a362f] mb-1">
              [A] Assessment: Clinical Interpretation & Progress
            </label>
            <textarea
              rows={2}
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              placeholder="Progress toward treatment goals, cognitive patterns examined, response to behavioral interventions..."
              className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321] font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2a362f] mb-1">
              [P] Plan: Interventions & Homework for Next Session
            </label>
            <textarea
              rows={2}
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="Assigned exercises, next scheduled session, referral recommendations, contingency precautions..."
              className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321] font-sans"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-[#eeebe3] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-[#647169]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Encrypted at rest • Inaccessible to clients</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-medium text-[#4f5c53] hover:bg-[#f2efe6] rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-[#1e2321] hover:bg-[#2e3732] rounded shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? 'Saving...' : 'Save Clinical Note'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
