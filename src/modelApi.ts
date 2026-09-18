import type { RealModelResult } from './types';

const API_BASE_URL = 'http://127.0.0.1:5000';

export const MODEL_STATES = [
  'analysis',
  'backdoor',
  'dos',
  'exploits',
  'fuzzers',
  'generic',
  'reconnaissance',
  'shellcode',
  'worms',
] as const;

export type ModelState = (typeof MODEL_STATES)[number];

interface PredictResponse {
  mode: 'REAL_MODEL_INFERENCE';
  model: string;
  input_sequence: string[];
  predicted_next_state: string;
  confidence: number;
  probabilities: Record<string, number>;
  mitre_interpretation: string[];
}

export async function predictNextState(
  sequence: ModelState[],
): Promise<RealModelResult> {
  if (sequence.length !== 8) {
    throw new Error(`Model requires exactly 8 states; received ${sequence.length}.`);
  }

  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sequence }),
  });

  if (!response.ok) {
    throw new Error(`Prediction API returned HTTP ${response.status}.`);
  }

  const data: PredictResponse = await response.json();

  if (data.mode !== 'REAL_MODEL_INFERENCE') {
    throw new Error('Prediction API did not return a real model inference result.');
  }

  return {
    predictedNextState: data.predicted_next_state,
    confidence: data.confidence,
    probabilities: data.probabilities,
    mitreInterpretation: data.mitre_interpretation,
  };
}
