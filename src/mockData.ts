import type { ThreatEvent, RiskDistribution, CategoryData } from './types';

export const THREAT_EVENTS: ThreatEvent[] = [
  { id: 'te-1', timestamp: '20:31:14', category: 'Reconnaissance', severity: 'HIGH', source: '10.0.0.15', target: 'Web Server', mitreStage: 'Reconnaissance', status: 'active' },
  { id: 'te-2', timestamp: '20:31:08', category: 'Network Anomaly', severity: 'MEDIUM', source: '10.0.0.42', target: 'Gateway', mitreStage: 'Reconnaissance', status: 'investigating' },
  { id: 'te-3', timestamp: '20:30:55', category: 'Port Scan', severity: 'HIGH', source: '10.0.0.15', target: 'App Server', mitreStage: 'Reconnaissance', status: 'active' },
  { id: 'te-4', timestamp: '20:30:41', category: 'Brute Force', severity: 'MEDIUM', source: '172.16.0.12', target: 'Database', mitreStage: 'Credential Access', status: 'mitigated' },
  { id: 'te-5', timestamp: '20:30:22', category: 'Data Exfiltration', severity: 'CRITICAL', source: '10.0.0.33', target: 'External', mitreStage: 'Exfiltration', status: 'investigating' },
  { id: 'te-6', timestamp: '20:30:10', category: 'Malware C2', severity: 'CRITICAL', source: '10.0.0.7', target: 'Workstation-01', mitreStage: 'Command and Control', status: 'active' },
  { id: 'te-7', timestamp: '20:29:48', category: 'Lateral Movement', severity: 'HIGH', source: '10.0.0.21', target: 'App Server', mitreStage: 'Lateral Movement', status: 'mitigated' },
  { id: 'te-8', timestamp: '20:29:30', category: 'Privilege Escalation', severity: 'HIGH', source: '192.168.1.4', target: 'Database', mitreStage: 'Privilege Escalation', status: 'investigating' },
  { id: 'te-9', timestamp: '20:29:12', category: 'DNS Tunneling', severity: 'MEDIUM', source: '10.0.0.42', target: 'External', mitreStage: 'Command and Control', status: 'mitigated' },
  { id: 'te-10', timestamp: '20:28:55', category: 'Web Shell', severity: 'CRITICAL', source: '10.0.0.15', target: 'Web Server', mitreStage: 'Execution', status: 'active' },
];

export const ATTACK_CATEGORIES: CategoryData[] = [
  { name: 'Reconnaissance', count: 34, color: '#22d3ee' },
  { name: 'Initial Access', count: 18, color: '#3b82f6' },
  { name: 'Execution', count: 12, color: '#f59e0b' },
  { name: 'Credential Access', count: 9, color: '#ef4444' },
  { name: 'Lateral Movement', count: 7, color: '#dc2626' },
  { name: 'Exfiltration', count: 5, color: '#b91c1c' },
  { name: 'C2 Communication', count: 8, color: '#f97316' },
  { name: 'Defense Evasion', count: 6, color: '#a78bfa' },
];

export const RISK_DISTRIBUTION: RiskDistribution[] = [
  { name: 'Critical', value: 12, color: '#dc2626' },
  { name: 'High', value: 28, color: '#ef4444' },
  { name: 'Medium', value: 35, color: '#f59e0b' },
  { name: 'Low', value: 25, color: '#10b981' },
];

export const MITRE_STAGE_DISTRIBUTION = [
  { stage: 'Recon', count: 34 },
  { stage: 'Init. Access', count: 18 },
  { stage: 'Execution', count: 12 },
  { stage: 'Persistence', count: 5 },
  { stage: 'Priv. Esc.', count: 4 },
  { stage: 'Def. Evasion', count: 6 },
  { stage: 'Cred. Access', count: 9 },
  { stage: 'Discovery', count: 7 },
  { stage: 'Lat. Movement', count: 7 },
  { stage: 'C2', count: 8 },
  { stage: 'Exfiltration', count: 5 },
  { stage: 'Impact', count: 3 },
];

export const CONFUSION_MATRIX = {
  truePositive: 142,
  falsePositive: 11,
  falseNegative: 10,
  trueNegative: 837,
};

export const DETECTION_PERFORMANCE = [
  { epoch: 1, precision: 0.71, recall: 0.68, f1: 0.69 },
  { epoch: 5, precision: 0.78, recall: 0.75, f1: 0.76 },
  { epoch: 10, precision: 0.84, recall: 0.81, f1: 0.82 },
  { epoch: 15, precision: 0.88, recall: 0.86, f1: 0.87 },
  { epoch: 20, precision: 0.91, recall: 0.90, f1: 0.90 },
  { epoch: 25, precision: 0.928, recall: 0.924, f1: 0.926 },
  { epoch: 30, precision: 0.931, recall: 0.927, f1: 0.929 },
];

export const FORECAST_CONFIDENCE = [
  { stage: 'Recon', confidence: 91 },
  { stage: 'Init. Access', confidence: 82 },
  { stage: 'Execution', confidence: 79 },
  { stage: 'Persistence', confidence: 68 },
  { stage: 'Priv. Esc.', confidence: 54 },
  { stage: 'Cred. Access', confidence: 47 },
];

export const NETWORK_TRAFFIC_HISTORY = Array.from({ length: 30 }, (_, i) => ({
  time: `${20}:${String(31 - Math.floor(i / 2)).padStart(2, '0')}:${String((i * 2) % 60).padStart(2, '0')}`,
  inbound: Math.floor(Math.random() * 300) + 200,
  outbound: Math.floor(Math.random() * 250) + 150,
  threats: Math.floor(Math.random() * 8),
}));
