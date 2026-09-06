import type {
  AttackStage,
  ForecastData,
  NetworkLink,
  NetworkNode,
  RiskLevel,
  SimPhase,
  SimState,
  ThreatStatus,
  TrafficEvent,
  TimelineEvent,
  AlertItem,
} from './types';

export const ATTACK_STAGES = [
  'Reconnaissance',
  'Initial Access',
  'Execution',
  'Persistence',
  'Privilege Escalation',
  'Defense Evasion',
  'Credential Access',
  'Discovery',
  'Lateral Movement',
  'Command and Control',
  'Exfiltration',
  'Impact',
] as const;

export const STAGE_DESCRIPTIONS: Record<string, string> = {
  Reconnaissance: 'Adversary gathering information about the target network',
  'Initial Access': 'Adversary attempting to establish foothold in the system',
  Execution: 'Adversary running malicious code on target systems',
  Persistence: 'Adversary maintaining access across restarts',
  'Privilege Escalation': 'Adversary gaining higher-level permissions',
  'Defense Evasion': 'Adversary avoiding detection and security controls',
  'Credential Access': 'Adversary stealing account credentials',
  Discovery: 'Adversary exploring the internal environment',
  'Lateral Movement': 'Adversary moving through the network',
  'Command and Control': 'Adversary establishing remote control channels',
  Exfiltration: 'Adversary stealing and removing data',
  Impact: 'Adversary disrupting availability or integrity',
};

export const BASE_NODES: NetworkNode[] = [
  { id: 'internet', label: 'Internet', x: 50, y: 8, type: 'internet', status: 'Normal' },
  { id: 'gateway', label: 'Gateway', x: 50, y: 28, type: 'gateway', status: 'Normal' },
  { id: 'web', label: 'Web Server', x: 50, y: 48, type: 'server', status: 'Normal' },
  { id: 'app', label: 'Application Server', x: 50, y: 68, type: 'server', status: 'Normal' },
  { id: 'db', label: 'Database Server', x: 50, y: 88, type: 'server', status: 'Normal' },
  { id: 'ws1', label: 'Workstation-01', x: 15, y: 48, type: 'workstation', status: 'Normal' },
  { id: 'ws2', label: 'Workstation-02', x: 85, y: 68, type: 'workstation', status: 'Normal' },
];

export const BASE_LINKS: NetworkLink[] = [
  { source: 'internet', target: 'gateway', status: 'Normal' },
  { source: 'gateway', target: 'web', status: 'Normal' },
  { source: 'web', target: 'app', status: 'Normal' },
  { source: 'app', target: 'db', status: 'Normal' },
  { source: 'ws1', target: 'web', status: 'Normal' },
  { source: 'ws2', target: 'app', status: 'Normal' },
];

const SOURCES = ['10.0.0.15', '10.0.0.21', '10.0.0.33', '10.0.0.42', '10.0.0.7', '192.168.1.4', '172.16.0.12'];
const DESTINATIONS = ['Web Server', 'App Server', 'Database', 'Gateway', 'Workstation-01', 'Workstation-02'];
const PROTOCOLS = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS', 'SSH', 'FTP'];

let trafficCounter = 0;

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateTrafficEvent(status: ThreatStatus = 'Normal', risk: RiskLevel = 'LOW'): TrafficEvent {
  trafficCounter++;
  const now = new Date();
  const ts = now.toLocaleTimeString('en-US', { hour12: false }) + '.' + String(Math.floor(Math.random() * 999)).padStart(3, '0');
  return {
    id: `traffic-${trafficCounter}`,
    timestamp: ts,
    source: randomItem(SOURCES),
    destination: randomItem(DESTINATIONS),
    protocol: randomItem(PROTOCOLS),
    packets: Math.floor(Math.random() * 500) + 10,
    status,
    risk,
  };
}

export function generateInitialTraffic(count: number = 8): TrafficEvent[] {
  return Array.from({ length: count }, () => generateTrafficEvent());
}

function makeStages(activeIndex: number = -1): AttackStage[] {
  return ATTACK_STAGES.map((name, i) => {
    let status: AttackStage['status'] = 'upcoming';
    if (i < activeIndex) status = 'completed';
    else if (i === activeIndex) status = 'current';
    else if (i === activeIndex + 1) status = 'predicted';
    return { name, status, description: STAGE_DESCRIPTIONS[name] || '' };
  });
}

function nowTime(): string {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

export function makeIdleState(): SimState {
  return {
    phase: 'idle',
    running: false,
    riskScore: 18,
    riskLevel: 'LOW',
    activeThreats: 0,
    predictedThreats: 0,
    networkHealth: 98,
    lastUpdate: nowTime(),
    detectedThreat: null,
    threatCategory: null,
    threatSeverity: null,
    threatConfidence: 0,
    stages: makeStages(-1),
    traffic: generateInitialTraffic(),
    timeline: [
      { id: 't-init-1', timestamp: nowTime(), message: 'System initialized — monitoring active', severity: 'info' },
    ],
    alerts: [],
    forecast: {
      currentStage: 'Normal',
      predictedNextStage: 'None',
      confidence: 0,
      risk: 'LOW',
      horizon: 'Next activity window',
      explanation: 'No active threats detected. System monitoring all network traffic for anomalies.',
    },
    nodes: BASE_NODES.map((n) => ({ ...n })),
    links: BASE_LINKS.map((l) => ({ ...l })),
  };
}

interface PhaseConfig {
  riskScore: number;
  riskLevel: RiskLevel;
  activeThreats: number;
  predictedThreats: number;
  networkHealth: number;
  stageIndex: number;
  detectedThreat: string | null;
  threatCategory: string | null;
  threatSeverity: RiskLevel | null;
  threatConfidence: number;
  forecast: ForecastData;
  trafficStatus: ThreatStatus;
  trafficRisk: RiskLevel;
  nodeStatuses: Record<string, ThreatStatus>;
  linkStatuses: Record<string, ThreatStatus>;
  timelineMessage: string;
  timelineSeverity: TimelineEvent['severity'];
  alert?: Omit<AlertItem, 'id' | 'timestamp'>;
}

function linkKey(a: string, b: string): string {
  return [a, b].sort().join('-');
}

export function getPhaseConfig(phase: SimPhase): PhaseConfig {
  switch (phase) {
    case 'idle':
    case 'normal':
      return {
        riskScore: 18,
        riskLevel: 'LOW',
        activeThreats: 0,
        predictedThreats: 0,
        networkHealth: 98,
        stageIndex: -1,
        detectedThreat: null,
        threatCategory: null,
        threatSeverity: null,
        threatConfidence: 0,
        forecast: {
          currentStage: 'Normal',
          predictedNextStage: 'None',
          confidence: 0,
          risk: 'LOW',
          horizon: 'Next activity window',
          explanation: 'No active threats detected. System monitoring all network traffic for anomalies.',
        },
        trafficStatus: 'Normal',
        trafficRisk: 'LOW',
        nodeStatuses: {},
        linkStatuses: {},
        timelineMessage: 'Normal network activity — all systems nominal',
        timelineSeverity: 'info',
      };

    case 'suspicious':
      return {
        riskScore: 42,
        riskLevel: 'MEDIUM',
        activeThreats: 1,
        predictedThreats: 1,
        networkHealth: 90,
        stageIndex: 0,
        detectedThreat: 'Anomalous Traffic Pattern',
        threatCategory: 'Reconnaissance',
        threatSeverity: 'MEDIUM',
        threatConfidence: 64,
        forecast: {
          currentStage: 'Reconnaissance',
          predictedNextStage: 'Initial Access',
          confidence: 64,
          risk: 'MEDIUM',
          horizon: 'Next activity window',
          explanation: 'Unusual traffic patterns detected. Based on observed behavioral anomalies, the system estimates a moderate probability of progression toward Initial Access.',
        },
        trafficStatus: 'Suspicious',
        trafficRisk: 'MEDIUM',
        nodeStatuses: { internet: 'Suspicious', gateway: 'Suspicious' },
        linkStatuses: { 'gateway-internet': 'Suspicious' },
        timelineMessage: 'Suspicious traffic pattern detected from external source',
        timelineSeverity: 'warning',
        alert: {
          severity: 'MEDIUM',
          threat: 'Anomalous Traffic Pattern',
          source: '10.0.0.15',
          predictedStage: 'Initial Access',
          recommendedAction: 'Monitor traffic from source host. Enable enhanced logging on gateway.',
        },
      };

    case 'reconnaissance':
      return {
        riskScore: 61,
        riskLevel: 'HIGH',
        activeThreats: 2,
        predictedThreats: 2,
        networkHealth: 82,
        stageIndex: 0,
        detectedThreat: 'Suspicious Network Scanning',
        threatCategory: 'Reconnaissance',
        threatSeverity: 'HIGH',
        threatConfidence: 74,
        forecast: {
          currentStage: 'Reconnaissance',
          predictedNextStage: 'Initial Access',
          confidence: 74,
          risk: 'HIGH',
          horizon: 'Next activity window',
          explanation: 'Reconnaissance activity confirmed. Based on the sequence of observed network behaviors, the system estimates an increased probability of progression toward Initial Access.',
        },
        trafficStatus: 'Suspicious',
        trafficRisk: 'HIGH',
        nodeStatuses: { internet: 'Suspicious', gateway: 'Suspicious', web: 'Suspicious' },
        linkStatuses: { 'gateway-internet': 'Suspicious', 'gateway-web': 'Suspicious' },
        timelineMessage: 'Reconnaissance identified — port scanning activity confirmed',
        timelineSeverity: 'warning',
        alert: {
          severity: 'HIGH',
          threat: 'Suspicious Network Scanning',
          source: '10.0.0.15',
          predictedStage: 'Initial Access',
          recommendedAction: 'Investigate source host and isolate if malicious behavior is confirmed.',
        },
      };

    case 'higher-risk':
      return {
        riskScore: 78,
        riskLevel: 'HIGH',
        activeThreats: 3,
        predictedThreats: 3,
        networkHealth: 72,
        stageIndex: 0,
        detectedThreat: 'Expanded Network Reconnaissance',
        threatCategory: 'Reconnaissance',
        threatSeverity: 'HIGH',
        threatConfidence: 82,
        forecast: {
          currentStage: 'Reconnaissance',
          predictedNextStage: 'Initial Access',
          confidence: 82,
          risk: 'HIGH',
          horizon: 'Next activity window',
          explanation: 'Reconnaissance activity intensifying. Probability of Initial Access progression has increased based on expanded scan patterns targeting exposed services.',
        },
        trafficStatus: 'Suspicious',
        trafficRisk: 'HIGH',
        nodeStatuses: { internet: 'Suspicious', gateway: 'Suspicious', web: 'Suspicious', app: 'Suspicious' },
        linkStatuses: { 'gateway-internet': 'Suspicious', 'gateway-web': 'Suspicious', 'gateway-app': 'Suspicious' },
        timelineMessage: 'Risk score elevated — scan patterns expanding to additional services',
        timelineSeverity: 'warning',
        alert: {
          severity: 'HIGH',
          threat: 'Expanded Reconnaissance Scan',
          source: '10.0.0.15',
          predictedStage: 'Initial Access',
          recommendedAction: 'Block source IP at gateway. Review web server access logs for exploitation attempts.',
        },
      };

    case 'alert':
      return {
        riskScore: 91,
        riskLevel: 'CRITICAL',
        activeThreats: 4,
        predictedThreats: 4,
        networkHealth: 55,
        stageIndex: 1,
        detectedThreat: 'Confirmed Intrusion — Initial Access Achieved',
        threatCategory: 'Initial Access',
        threatSeverity: 'CRITICAL',
        threatConfidence: 79,
        forecast: {
          currentStage: 'Initial Access',
          predictedNextStage: 'Execution',
          confidence: 79,
          risk: 'CRITICAL',
          horizon: 'Next activity window',
          explanation: 'Initial Access confirmed on Web Server. Based on observed exploitation patterns, the system estimates a high probability of Execution stage progression. Immediate containment recommended.',
        },
        trafficStatus: 'Compromised',
        trafficRisk: 'CRITICAL',
        nodeStatuses: { internet: 'Compromised', gateway: 'Suspicious', web: 'Compromised', app: 'Suspicious', db: 'Suspicious' },
        linkStatuses: { 'gateway-internet': 'Compromised', 'gateway-web': 'Compromised', 'web-app': 'Suspicious', 'app-db': 'Suspicious' },
        timelineMessage: 'HIGH RISK ALERT — Initial Access confirmed, Execution predicted as next stage',
        timelineSeverity: 'critical',
        alert: {
          severity: 'CRITICAL',
          threat: 'Confirmed Initial Access',
          source: '10.0.0.15',
          predictedStage: 'Execution',
          recommendedAction: 'Isolate Web Server from network immediately. Activate incident response playbook. Preserve forensic evidence.',
        },
      };

    default:
      return getPhaseConfig('normal');
  }
}

export function applyPhaseToState(state: SimState, phase: SimPhase): SimState {
  const config = getPhaseConfig(phase);

  const newNodes = BASE_NODES.map((n) => ({
    ...n,
    status: (config.nodeStatuses[n.id] || 'Normal') as ThreatStatus,
  }));

  const newLinks = BASE_LINKS.map((l) => ({
    ...l,
    status: (config.linkStatuses[linkKey(l.source, l.target)] || 'Normal') as ThreatStatus,
  }));

  const newTrafficEvent = generateTrafficEvent(config.trafficStatus, config.trafficRisk);
  const updatedTraffic = [newTrafficEvent, ...state.traffic].slice(0, 30);

  const newTimelineEvent: TimelineEvent = {
    id: `tl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: nowTime(),
    message: config.timelineMessage,
    severity: config.timelineSeverity,
  };
  const updatedTimeline = [newTimelineEvent, ...state.timeline].slice(0, 20);

  let updatedAlerts = state.alerts;
  if (config.alert) {
    const newAlert: AlertItem = {
      ...config.alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: nowTime(),
    };
    updatedAlerts = [newAlert, ...state.alerts].slice(0, 10);
  }

  return {
    ...state,
    phase,
    riskScore: config.riskScore,
    riskLevel: config.riskLevel,
    activeThreats: config.activeThreats,
    predictedThreats: config.predictedThreats,
    networkHealth: config.networkHealth,
    lastUpdate: nowTime(),
    detectedThreat: config.detectedThreat,
    threatCategory: config.threatCategory,
    threatSeverity: config.threatSeverity,
    threatConfidence: config.threatConfidence,
    stages: makeStages(config.stageIndex),
    forecast: config.forecast,
    traffic: updatedTraffic,
    timeline: updatedTimeline,
    alerts: updatedAlerts,
    nodes: newNodes,
    links: newLinks,
  };
}

export const SIMULATION_SEQUENCE: SimPhase[] = [
  'normal',
  'suspicious',
  'reconnaissance',
  'higher-risk',
  'alert',
];

export const PHASE_DURATION = 4000;

export function riskLevelColor(level: RiskLevel): string {
  switch (level) {
    case 'LOW': return '#10b981';
    case 'MEDIUM': return '#f59e0b';
    case 'HIGH': return '#ef4444';
    case 'CRITICAL': return '#dc2626';
    default: return '#64748b';
  }
}

export function statusColor(status: ThreatStatus): string {
  switch (status) {
    case 'Normal': return '#10b981';
    case 'Suspicious': return '#f59e0b';
    case 'Compromised': return '#ef4444';
    default: return '#64748b';
  }
}
