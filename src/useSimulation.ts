import { useCallback, useEffect, useRef, useState } from 'react';
import type { SimPhase, SimState } from './types';
import {
  applyPhaseToState,
  generateInitialTraffic,
  generateTrafficEvent,
  makeIdleState,
  SIMULATION_SEQUENCE,
  PHASE_DURATION,
} from './simulation';

const TRAFFIC_TICK = 2500;

export function useSimulation() {
  const [state, setState] = useState<SimState>(() => makeIdleState());
  const [running, setRunning] = useState(false);
  const phaseIndexRef = useRef(0);
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trafficTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);

  const clearPhaseTimer = useCallback(() => {
    if (phaseTimerRef.current) {
      clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }
  }, []);

  const advancePhase = useCallback(() => {
    if (pausedRef.current) return;

    const idx = phaseIndexRef.current;
    if (idx >= SIMULATION_SEQUENCE.length) {
      setRunning(false);
      return;
    }

    const phase = SIMULATION_SEQUENCE[idx];
    phaseIndexRef.current += 1;

    setState((prev) => applyPhaseToState(prev, phase));

    if (idx < SIMULATION_SEQUENCE.length - 1) {
      phaseTimerRef.current = setTimeout(advancePhase, PHASE_DURATION);
    } else {
      setRunning(false);
    }
  }, []);

  const start = useCallback(() => {
    clearPhaseTimer();
    pausedRef.current = false;
    phaseIndexRef.current = 0;
    setRunning(true);

    setState((prev) => applyPhaseToState(prev, SIMULATION_SEQUENCE[0]));
    phaseIndexRef.current = 1;
    phaseTimerRef.current = setTimeout(advancePhase, PHASE_DURATION);
  }, [advancePhase, clearPhaseTimer]);

  const pause = useCallback(() => {
    pausedRef.current = true;
    clearPhaseTimer();
    setRunning(false);
  }, [clearPhaseTimer]);

  const reset = useCallback(() => {
    pausedRef.current = true;
    clearPhaseTimer();
    phaseIndexRef.current = 0;
    setRunning(false);
    setState(makeIdleState());
  }, [clearPhaseTimer]);

  useEffect(() => {
    trafficTimerRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.phase === 'idle') return prev;
        const config = getTrafficConfigForPhase(prev.phase);
        const newEvent = generateTrafficEvent(config.status, config.risk);
        return {
          ...prev,
          traffic: [newEvent, ...prev.traffic].slice(0, 30),
          lastUpdate: new Date().toLocaleTimeString('en-US', { hour12: false }),
        };
      });
    }, TRAFFIC_TICK);

    return () => {
      if (trafficTimerRef.current) clearInterval(trafficTimerRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      clearPhaseTimer();
      if (trafficTimerRef.current) clearInterval(trafficTimerRef.current);
    };
  }, [clearPhaseTimer]);

  return { state, running, start, pause, reset };
}

function getTrafficConfigForPhase(phase: SimPhase): { status: 'Normal' | 'Suspicious' | 'Compromised'; risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' } {
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
