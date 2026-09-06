export type ThreatStatus = 'Normal' | 'Suspicious' | 'Compromised';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SimPhase =
  | 'idle'
  | 'normal'
  | 'suspicious'
  | 'reconnaissance'
  | 'higher-risk'
  | 'alert';

export interface AttackStage {
  name: string;
  status: 'completed' | 'current' | 'predicted' | 'upcoming';
  description: string;
}

export interface TrafficEvent {
  id: string;
  timestamp: string;
  source: string;
  destination: string;
  protocol: string;
  packets: number;
  status: ThreatStatus;
  risk: RiskLevel;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface AlertItem {
  id: string;
  severity: RiskLevel;
  timestamp: string;
  threat: string;
  source: string;
  predictedStage: string;
  recommendedAction: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'internet' | 'gateway' | 'server' | 'workstation';
  status: ThreatStatus;
}

export interface NetworkLink {
  source: string;
  target: string;
  status: ThreatStatus;
  label?: string;
}

export interface ForecastData {
  currentStage: string;
  predictedNextStage: string;
  confidence: number;
  risk: RiskLevel;
  horizon: string;
  explanation: string;
}

export interface SimState {
  phase: SimPhase;
  running: boolean;
  riskScore: number;
  riskLevel: RiskLevel;
  activeThreats: number;
  predictedThreats: number;
  networkHealth: number;
  lastUpdate: string;
  detectedThreat: string | null;
  threatCategory: string | null;
  threatSeverity: RiskLevel | null;
  threatConfidence: number;
  stages: AttackStage[];
  traffic: TrafficEvent[];
  timeline: TimelineEvent[];
  alerts: AlertItem[];
  forecast: ForecastData;
  nodes: NetworkNode[];
  links: NetworkLink[];
}

export interface ThreatEvent {
  id: string;
  timestamp: string;
  category: string;
  severity: RiskLevel;
  source: string;
  target: string;
  mitreStage: string;
  status: 'mitigated' | 'active' | 'investigating';
}

export interface RiskDistribution {
  name: string;
  value: number;
  color: string;
}

export interface CategoryData {
  name: string;
  count: number;
  color: string;
}
