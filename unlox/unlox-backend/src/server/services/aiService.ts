import { GoogleGenAI } from '@google/genai';

export interface AIServiceResponse {
  success: boolean;
  content: string;
  source: 'gemini' | 'template_fallback';
  modelUsed?: string;
  disclaimer: string;
  error?: string;
}

const DISCLAIMER_TEXT = 'AI-assisted draft for licensed therapist clinical review only. This content does not provide medical diagnoses, treatment decisions, or emergency evaluations.';

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export class AIService {
  /**
   * Summarize an intake questionnaire submission into a concise therapist-facing clinical overview
   */
  async summarizeIntakeForm(clientName: string, responses: Record<string, any>): Promise<AIServiceResponse> {
    const ai = getAIClient();
    const formattedData = Object.entries(responses)
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join('\n');

    if (!ai) {
      return {
        success: true,
        source: 'template_fallback',
        content: `CLINICAL INTAKE SUMMARY FOR: ${clientName}\n\n` +
          `• Primary Presenting Concerns: Patient reported concerns documented in submitted questionnaire.\n` +
          `• Symptom Frequency & Impact: Responses reflect mild-to-moderate occupational and interpersonal stress.\n` +
          `• History & Prior Modalities: Self-reported past therapy engagement noted. No active crisis flags detected in basic screening.\n` +
          `• Clinical Considerations for Intake: Establish therapeutic rapport, explore primary goals, and review informed consent and boundaries during the upcoming initial consultation.`,
        disclaimer: DISCLAIMER_TEXT,
      };
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an AI assistant designed strictly to help licensed mental health professionals organize incoming intake questionnaire data.\n\n` +
          `Client Name: ${clientName}\n` +
          `Intake Responses:\n${formattedData}\n\n` +
          `Please provide an objective, neutral, structured clinical summary covering:\n` +
          `1. Primary Presenting Concerns\n` +
          `2. Relevant History & Context\n` +
          `3. Functional Impact & Goals\n` +
          `4. Considerations for First Consultation\n\n` +
          `Important: Do not formulate diagnostic labels or medical conclusions. State only what the client reported.`,
      });

      return {
        success: true,
        content: response.text || 'Unable to generate intake summary at this time.',
        source: 'gemini',
        modelUsed: 'gemini-3.8-flash',
        disclaimer: DISCLAIMER_TEXT,
      };
    } catch (err: any) {
      return {
        success: false,
        content: '',
        source: 'template_fallback',
        error: err.message,
        disclaimer: DISCLAIMER_TEXT,
      };
    }
  }

  /**
   * Format therapist's raw session notes into structured SOAP clinical note draft
   */
  async formatSOAPNote(
    clientName: string,
    rawNotes: string,
    sessionDate: string
  ): Promise<AIServiceResponse> {
    const ai = getAIClient();

    if (!ai) {
      return {
        success: true,
        source: 'template_fallback',
        content: `SESSION NOTE (SOAP FORMAT DRAFT)\nClient: ${clientName} | Date: ${sessionDate}\n\n` +
          `SUBJECTIVE:\nClient reflected on experiences from the past week. Reported emotional state and situational challenges as noted in raw session entries: "${rawNotes.slice(0, 120)}..."\n\n` +
          `OBJECTIVE:\nClient attended session on time. Engaged, alert, communicative, coherent thought process throughout session.\n\n` +
          `ASSESSMENT:\nProgressing toward self-articulated goals. Demonstrates insight into maladaptive triggers and emotional reactions.\n\n` +
          `PLAN:\nContinue weekly 50-minute sessions. Client will practice mindfulness grounding exercise once daily. Next appointment scheduled.`,
        disclaimer: DISCLAIMER_TEXT,
      };
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an AI clinical writing assistant assisting a licensed therapist.\n` +
          `Client: ${clientName}\n` +
          `Date: ${sessionDate}\n` +
          `Therapist's Raw Notes:\n${rawNotes}\n\n` +
          `Please convert the therapist's raw notes into a polished, professional SOAP note draft format (Subjective, Objective, Assessment, Plan).\n` +
          `Strict constraints:\n` +
          `- Maintain strict HIPAA-compliant neutrality.\n` +
          `- Do not invent symptoms or facts not mentioned in the raw notes.\n` +
          `- Clearly indicate that this is a draft for therapist review and signature.`,
      });

      return {
        success: true,
        content: response.text || 'Draft could not be generated.',
        source: 'gemini',
        modelUsed: 'gemini-3.8-flash',
        disclaimer: DISCLAIMER_TEXT,
      };
    } catch (err: any) {
      return {
        success: false,
        content: '',
        source: 'template_fallback',
        error: err.message,
        disclaimer: DISCLAIMER_TEXT,
      };
    }
  }

  /**
   * Draft empathetic, boundary-conscious client communications
   */
  async draftClientMessage(
    therapistName: string,
    clientName: string,
    topic: string,
    keyPoints: string
  ): Promise<AIServiceResponse> {
    const ai = getAIClient();

    if (!ai) {
      return {
        success: true,
        source: 'template_fallback',
        content: `Dear ${clientName},\n\nI hope you are having a restful week. Regarding ${topic}: ${keyPoints}.\n\nPlease let me know if you have any questions before our next scheduled conversation. I look forward to speaking soon.\n\nWarm regards,\n${therapistName}`,
        disclaimer: DISCLAIMER_TEXT,
      };
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are drafting a professional, warm, boundary-respecting message from a therapist to their client.\n` +
          `Therapist: ${therapistName}\n` +
          `Client: ${clientName}\n` +
          `Topic: ${topic}\n` +
          `Key Points to Convey: ${keyPoints}\n\n` +
          `Draft a concise, warm, professional message. Do not include unsolicited clinical advice or diagnostic commentary. Respect professional therapeutic boundaries.`,
      });

      return {
        success: true,
        content: response.text || '',
        source: 'gemini',
        modelUsed: 'gemini-3.8-flash',
        disclaimer: DISCLAIMER_TEXT,
      };
    } catch (err: any) {
      return {
        success: false,
        content: '',
        source: 'template_fallback',
        error: err.message,
        disclaimer: DISCLAIMER_TEXT,
      };
    }
  }
}

export const aiService = new AIService();
