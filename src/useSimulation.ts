import { useCallback, useEffect, useRef, useState } from 'react';
import type { SimPhase, SimState } from './types';
import {
  applyPhaseToState,
  generateTrafficEvent,
  makeIdleState,
  SIMULATION_SEQUENCE,
  PHASE_DURATION,
} from './simulation';
import { predictNextState, type ModelState } from './modelApi';

const TRAFFIC_TICK = 2000;

function phaseToModelState(phase: SimPhase): ModelState {
  switch (phase) {
    case 'normal':
      return 'generic';

    case 'suspicious':
      return 'reconnaissance';

    case 'reconnaissance':
      return 'reconnaissance';

    case 'higher-risk':
      return 'reconnaissance';

    case 'alert':
      return 'exploits';

    case 'idle':
    default:
      return 'generic';
  }
}

export function useSimulation() {
  const [state, setState] = useState<SimState>(() => makeIdleState());
  const [running, setRunning] = useState(false);

  const phaseIndexRef = useRef(0);
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trafficTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);
  const activePhaseRef = useRef<SimPhase>('idle');

  const modelSequenceRef = useRef<ModelState[]>([]);
  const modelRequestRef = useRef(false);

  const clearPhaseTimer = useCallback(() => {
    if (phaseTimerRef.current) {
      clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }
  }, []);

  const runRealModelPrediction = useCallback(async (sequence: ModelState[]) => {
    if (sequence.length !== 8 || modelRequestRef.current) {
      return;
    }

    modelRequestRef.current = true;

    try {
      const result = await predictNextState(sequence);

      setState((prev) => ({
        ...prev,
        dataMode: 'REAL_MODEL_INFERENCE',
        modelResult: result,
        forecast: {
          ...prev.forecast,
          currentStage:
            result.mitreInterpretation[0] || prev.forecast.currentStage,
          predictedNextStage:
            result.mitreInterpretation[1] ||
            result.mitreInterpretation[0] ||
            prev.forecast.predictedNextStage,
          confidence: result.confidence,
          explanation:
            `Real Temporal Forecaster inference: predicted next UNSW-NB15 state is "${result.predictedNextState}" with ${result.confidence.toFixed(2)}% confidence. The 8-state input sequence was derived from the current dashboard simulation. MITRE interpretation is an analysis layer, not a direct model label.`,
        },
        lastUpdate: new Date().toLocaleTimeString('en-US', {
          hour12: false,
        }),
      }));
    } catch (error) {
      console.error('Real model inference failed:', error);

      setState((prev) => ({
        ...prev,
        dataMode: 'ERROR_FALLBACK',
        modelResult: null,
        lastUpdate: new Date().toLocaleTimeString('en-US', {
          hour12: false,
        }),
      }));
    } finally {
      modelRequestRef.current = false;
    }
  }, []);

  const addModelState = useCallback(
    (phase: SimPhase) => {
      const modelState = phaseToModelState(phase);

      modelSequenceRef.current = [
        ...modelSequenceRef.current,
        modelState,
      ].slice(-8);

      setState((prev) => ({
        ...prev,
        modelInputSequence: [...modelSequenceRef.current],
      }));

      if (modelSequenceRef.current.length === 8) {
        void runRealModelPrediction([...modelSequenceRef.current]);
      }
    },
    [runRealModelPrediction],
  );

  const advancePhase = useCallback(() => {
    if (pausedRef.current) return;

    const idx = phaseIndexRef.current;

    if (idx >= SIMULATION_SEQUENCE.length) {
      setRunning(false);
      return;
    }

    const phase = SIMULATION_SEQUENCE[idx];
    activePhaseRef.current = phase;
    phaseIndexRef.current += 1;

    setState((prev) => applyPhaseToState(prev, phase));

    if (idx < SIMULATION_SEQUENCE.length - 1) {
      phaseTimerRef.current = setTimeout(advancePhase, PHASE_DURATION);
    } else {
      setRunning(false);
      activePhaseRef.current = 'idle';
    }
  }, [addModelState]);

  const start = useCallback(() => {
    clearPhaseTimer();
    pausedRef.current = false;
    phaseIndexRef.current = 0;
    modelSequenceRef.current = [];
    modelRequestRef.current = false;

    setRunning(true);

    const firstPhase = SIMULATION_SEQUENCE[0];

    activePhaseRef.current = firstPhase;

    setState((prev) => applyPhaseToState(prev, firstPhase));

    phaseIndexRef.current = 1;
    phaseTimerRef.current = setTimeout(advancePhase, PHASE_DURATION);
  }, [addModelState, advancePhase, clearPhaseTimer]);

  const pause = useCallback(() => {
    pausedRef.current = true;
    clearPhaseTimer();
    setRunning(false);
  }, [clearPhaseTimer]);

  const reset = useCallback(() => {
    pausedRef.current = true;
    clearPhaseTimer();
    phaseIndexRef.current = 0;
    modelSequenceRef.current = [];
    modelRequestRef.current = false;

    setRunning(false);
    setState(makeIdleState());
  }, [clearPhaseTimer]);

  useEffect(() => {
    trafficTimerRef.current = setInterval(() => {
      const activePhase = activePhaseRef.current;

      if (activePhase === 'idle') return;

      const config = getTrafficConfigForPhase(activePhase);
      const newEvent = generateTrafficEvent(
        config.status,
        config.risk,
      );

      setState((prev) => ({
        ...prev,
        traffic: [newEvent, ...prev.traffic].slice(0, 30),
        lastUpdate: new Date().toLocaleTimeString('en-US', {
          hour12: false,
        }),
      }));

      addModelState(activePhase);
    }, TRAFFIC_TICK);

    return () => {
      if (trafficTimerRef.current) {
        clearInterval(trafficTimerRef.current);
      }
    };
  }, [addModelState]);

  useEffect(() => {
    return () => {
      clearPhaseTimer();

      if (trafficTimerRef.current) {
        clearInterval(trafficTimerRef.current);
      }
    };
  }, [clearPhaseTimer]);

  return {
    state,
    running,
    start,
    pause,
    reset,
  };
}

function getTrafficConfigForPhase(
  phase: SimPhase,
): {
  status: 'Normal' | 'Suspicious' | 'Compromised';
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
} {
  switch (phase) {
    case 'idle':
    case 'normal':
      return { status: 'Normal', risk: 'LOW' };

    case 'suspicious':
      return { status: 'Suspicious', risk: 'MEDIUM' };

    case 'reconnaissance':
    case 'higher-risk':
      return { status: 'Suspicious', risk: 'HIGH' };

    case 'alert':
      return { status: 'Compromised', risk: 'CRITICAL' };

    default:
      return { status: 'Normal', risk: 'LOW' };
  }
}









