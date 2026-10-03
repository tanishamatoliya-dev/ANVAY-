import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../api/axiosInstance';
import { Sparkles, Copy, Check, AlertCircle, FileText, MessageSquare, ClipboardList } from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDraft?: (draftText: string, targetType: 'soap' | 'message') => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onApplyDraft,
}) => {
  const [toolTab, setToolTab] = useState<'soap' | 'message' | 'intake'>('soap');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form inputs
  const [clientName, setClientName] = useState('Julian Ross');
  const [rawNotes, setRawNotes] = useState('Client reported feeling overwhelmed by deadline deliverables. Sleep disturbed 3x this week. Did 5 min breathing exercise twice with mild relief. Discussed catastrophic cognitive thoughts around peer judgment.');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [messageTopic, setMessageTopic] = useState('Session rescheduling reminder');
  const [messagePoints, setMessagePoints] = useState('Our regular Thursday slot is moved to Friday 2pm due to conference. Please confirm if that works or if Tuesday morning is better.');
  const [intakeText, setIntakeText] = useState('Primary reason: acute career burnout, panic onset in crowded trains. Medical history: no chronic illness. Prior therapy: 6 months CBT in 2022. Goals: reduce daily panic frequency, improve work-life boundaries.');

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      if (toolTab === 'soap') {
        const res: any = await api.post('/ai/format-soap', {
          clientName,
          rawNotes,
          sessionDate,
        });
        setResult(res);
      } else if (toolTab === 'message') {
        const res: any = await api.post('/ai/draft-message', {
          clientName,
          topic: messageTopic,
          keyPoints: messagePoints,
        });
        setResult(res);
      } else if (toolTab === 'intake') {
        const res: any = await api.post('/ai/summarize-intake', {
          clientName,
          responses: { rawIntake: intakeText },
        });
        setResult(res);
      }
    } catch (err: any) {
      setError(err.message || 'AI generation failed. Ensure your plan entitlements allow AI assistance.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.content) {
      navigator.clipboard.writeText(result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Clinical Practice Assistant"
      subtitle="Assists therapist workflow with structured clinical drafting. Never makes diagnoses."
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5 text-xs">
        {/* Tool Mode Tabs */}
        <div className="flex border-b border-[#e7e5dc] gap-6">
          <button
            onClick={() => { setToolTab('soap'); setResult(null); }}
            className={`pb-2.5 font-medium transition-colors flex items-center gap-1.5 ${
              toolTab === 'soap'
                ? 'border-b-2 border-[#1e2321] text-[#1e2321]'
                : 'text-[#626e68] hover:text-[#1e2321]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>SOAP Note Assistant</span>
          </button>

          <button
            onClick={() => { setToolTab('message'); setResult(null); }}
            className={`pb-2.5 font-medium transition-colors flex items-center gap-1.5 ${
              toolTab === 'message'
                ? 'border-b-2 border-[#1e2321] text-[#1e2321]'
                : 'text-[#626e68] hover:text-[#1e2321]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Client Communication Drafter</span>
          </button>

          <button
            onClick={() => { setToolTab('intake'); setResult(null); }}
            className={`pb-2.5 font-medium transition-colors flex items-center gap-1.5 ${
              toolTab === 'intake'
                ? 'border-b-2 border-[#1e2321] text-[#1e2321]'
                : 'text-[#626e68] hover:text-[#1e2321]'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Intake Questionnaire Summarizer</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">
            {error}
          </div>
        )}

        {/* Inputs */}
        <div className="space-y-3">
          <div>
            <label className="block font-semibold text-[#1e2321] mb-1">
              Client Name
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
            />
          </div>

          {toolTab === 'soap' && (
            <div>
              <label className="block font-semibold text-[#1e2321] mb-1">
                Therapist's Raw Clinical Bullet Points
              </label>
              <textarea
                rows={4}
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
                placeholder="Enter your rough session observations, homework check-in, affect notes..."
                className="w-full px-3 py-2 bg-white border border-[#cfcbc0] rounded text-[#1e2321] font-sans"
              />
            </div>
          )}

          {toolTab === 'message' && (
            <>
              <div>
                <label className="block font-semibold text-[#1e2321] mb-1">
                  Message Purpose / Topic
                </label>
                <input
                  type="text"
                  value={messageTopic}
                  onChange={(e) => setMessageTopic(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#1e2321] mb-1">
                  Key Points to Communicate
                </label>
                <textarea
                  rows={3}
                  value={messagePoints}
                  onChange={(e) => setMessagePoints(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
                />
              </div>
            </>
          )}

          {toolTab === 'intake' && (
            <div>
              <label className="block font-semibold text-[#1e2321] mb-1">
                Client Intake Questionnaire Responses
              </label>
              <textarea
                rows={4}
                value={intakeText}
                onChange={(e) => setIntakeText(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#cfcbc0] rounded text-[#1e2321]"
              />
            </div>
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#1e2321] hover:bg-[#2b3530] disabled:opacity-50 rounded shadow-xs transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{loading ? 'Synthesizing with Gemini AI...' : 'Generate Clinical Draft'}</span>
        </button>

        {/* AI Output Card with Mandatory Medical Disclaimer */}
        {result && (
          <div className="mt-4 p-4 bg-[#f8f7f2] border border-[#d8d3c5] rounded space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#1e2321] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#3b5242]" />
                <span>AI-Assisted Clinical Draft ({result.modelUsed || 'Gemini 3.8 Flash'})</span>
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-[#4f5c53] hover:text-[#1e2321] border border-[#d6d2c6] px-2 py-1 rounded bg-white"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>

            <div className="p-3 bg-white border border-[#dedad0] rounded whitespace-pre-line text-xs font-mono text-[#242f28] leading-relaxed max-h-64 overflow-y-auto">
              {result.content}
            </div>

            {/* Regulatory Disclaimer Requirement */}
            <div className="flex items-start gap-2 p-2.5 bg-amber-50/70 border border-amber-200/80 rounded text-[11px] text-amber-900 leading-snug">
              <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span>{result.disclaimer}</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
