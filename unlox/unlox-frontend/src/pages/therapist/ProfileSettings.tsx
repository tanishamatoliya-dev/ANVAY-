import React, { useState, useEffect } from 'react';
import { api } from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { ExternalLink, Save, Check, User, Link as LinkIcon, Plus, Trash2 } from 'lucide-react';

interface ProfileSettingsProps {
  onNavigate?: (tab: string) => void;
}

export const ProfileSettingsPage: React.FC<ProfileSettingsProps> = ({ onNavigate }) => {
  const { therapist, refreshUser } = useAuth();
  const [professionalName, setProfessionalName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [languages, setLanguages] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [slug, setSlug] = useState('');
  const [sessionTypes, setSessionTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (therapist) {
      setProfessionalName(therapist.professionalName || '');
      setTitle(therapist.title || '');
      setBio(therapist.bio || '');
      setSpecialties(therapist.specialties ? therapist.specialties.join(', ') : '');
      setLanguages(therapist.languages ? therapist.languages.join(', ') : 'English');
      setQualifications(therapist.qualifications ? therapist.qualifications.join('\n') : '');
      setSlug(therapist.slug || '');
      setSessionTypes(therapist.sessionTypes || []);
    }
  }, [therapist]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put('/therapists/profile', {
        professionalName,
        title,
        bio,
        specialties: specialties.split(',').map((s) => s.trim()).filter(Boolean),
        languages: languages.split(',').map((s) => s.trim()).filter(Boolean),
        qualifications: qualifications.split('\n').map((s) => s.trim()).filter(Boolean),
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
        sessionTypes,
      });

      await refreshUser();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e: any) {
      alert(e.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSessionType = () => {
    setSessionTypes([
      ...sessionTypes,
      {
        id: `st_${Date.now()}`,
        name: 'New Consultation Modality',
        durationMinutes: 50,
        price: 180,
        currency: 'USD',
        description: 'Standard 50-minute clinical psychotherapy session.',
      },
    ]);
  };

  const handleRemoveSessionType = (index: number) => {
    setSessionTypes(sessionTypes.filter((_, i) => i !== index));
  };

  const handleUpdateSessionType = (index: number, field: string, value: any) => {
    setSessionTypes(
      sessionTypes.map((st, i) => (i === index ? { ...st, [field]: value } : st))
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e7e5dc] pb-6">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-widest text-[#727f77] block mb-1">
            Branding & Credentials
          </span>
          <h1 className="font-serif-editorial text-3xl font-medium tracking-tight text-[#1e2321]">
            Therapist Profile & Public Link
          </h1>
          <p className="text-xs text-[#5e6b63] mt-1">
            Configure your editorial public profile and booking portal for prospective clients.
          </p>
        </div>

        {therapist && (
          <button
            onClick={() => onNavigate && onNavigate(`public_booking_${slug || therapist.slug}`)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#2d3831] bg-[#f4f2ea] hover:bg-[#eae6db] border border-[#d8d3c5] rounded transition-colors"
          >
            <span>Preview Public Profile</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#5e6963]" />
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Public Booking Link Card */}
        <div className="p-4 bg-[#f8f7f2] border border-[#ded9cc] rounded space-y-2">
          <label className="block text-xs font-bold text-[#1e2321]">
            Custom Public Booking URL
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6e7a73] font-mono select-none">
              https://unlox.practice/t/
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="dr-clara-vance"
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#cfcbc0] rounded font-mono text-[#1e2321]"
            />
          </div>
          <span className="text-[10px] text-[#717d76] block">
            Clients visit this address to review qualifications, session types, and available booking slots.
          </span>
        </div>

        {/* Bio & Credentials */}
        <div className="bg-[#fdfdfc] border border-[#e2dfd5] rounded p-6 space-y-4">
          <h3 className="font-serif-editorial text-lg font-semibold text-[#1e2321] border-b border-[#eeebe3] pb-2">
            Professional Overview
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1e2321] mb-1">
                Professional Full Name & Credentials *
              </label>
              <input
                type="text"
                required
                value={professionalName}
                onChange={(e) => setProfessionalName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1e2321] mb-1">
                Clinical Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1e2321] mb-1">
              Therapist Practice Bio (Editorial)
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321] leading-relaxed font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1e2321] mb-1">
                Specialties (Comma Separated)
              </label>
              <input
                type="text"
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1e2321] mb-1">
                Languages Spoken
              </label>
              <input
                type="text"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1e2321] mb-1">
              Degrees & Licenses (One per line)
            </label>
            <textarea
              rows={3}
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
            />
          </div>
        </div>

        {/* Session Types & Pricing */}
        <div className="bg-[#fdfdfc] border border-[#e2dfd5] rounded p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#eeebe3] pb-2">
            <div>
              <h3 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
                Session Types & Fee Schedule
              </h3>
              <p className="text-xs text-[#6a7670]">
                Modalities presented on your public booking page.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddSessionType}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#2d3831] bg-[#f4f2ea] hover:bg-[#eae6dc] border border-[#d8d3c5] rounded"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Modality</span>
            </button>
          </div>

          <div className="space-y-3">
            {sessionTypes.map((st, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#faf9f6] border border-[#dedad0] rounded grid grid-cols-1 sm:grid-cols-4 gap-3 items-center text-xs"
              >
                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-[#717c76] mb-0.5">Modality Name</label>
                  <input
                    type="text"
                    value={st.name}
                    onChange={(e) => handleUpdateSessionType(idx, 'name', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#cfcbc0] rounded font-semibold text-[#1e2321]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#717c76] mb-0.5">Duration (Min)</label>
                  <select
                    value={st.durationMinutes}
                    onChange={(e) => handleUpdateSessionType(idx, 'durationMinutes', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
                  >
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={50}>50 min</option>
                    <option value={60}>60 min</option>
                    <option value={75}>75 min</option>
                    <option value={90}>90 min</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] text-[#717c76] mb-0.5">Fee ($ USD)</label>
                    <input
                      type="number"
                      value={st.price}
                      onChange={(e) => handleUpdateSessionType(idx, 'price', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#cfcbc0] rounded font-mono text-[#1e2321]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSessionType(idx)}
                    className="mt-4 p-1.5 text-[#738078] hover:text-[#991b1b] rounded"
                    title="Remove session type"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-medium text-white bg-[#1e2321] hover:bg-[#2b3530] rounded shadow-xs transition-colors"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Profile Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
