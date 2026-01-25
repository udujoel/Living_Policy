export interface PolicyAnalysis {
  title: string;
  summary: string;
  goals: PolicyGoal[];
  levers: PolicyLever[];
  constraints: PolicyConstraint[];
  populations: string[];
  sectors: string[];
}

export interface PolicyGoal {
  id: string;
  title: string;
  metric: string;
  target_deadline?: string;
  source_para?: string;
}

export interface PolicyLever {
  id: string;
  name: string;
  description: string;
  current_value: string;
  unit: string;
  type: 'percentage' | 'currency' | 'numeric' | 'boolean' | 'text';
  range?: { min: number; max: number };
}

export interface PolicyConstraint {
  id: string;
  type: 'budget' | 'legal' | 'geographic' | 'other';
  description: string;
}

export interface SimulationResult {
  scenario_id: string;
  name: string;
  reasoning_summary?: string;
  outcomes: {
    economic: IndicatorGroup;
    social: IndicatorGroup;
    environmental: IndicatorGroup;
  };
  timeline_events?: TimelineEvent[];
  kpis?: Record<string, KPIDetail>;
  stakeholder_impacts?: StakeholderImpact[];
  short_term_impact: string;
  long_term_impact: string;
  trade_offs: string[];
  second_order_effects: string[];
  assumptions: Assumption[];
  sdg_alignment: SDGAlignment[];
  regional_analysis?: RegionalImpact[];
}

export interface RegionalImpact {
  region_name: string;
  coordinates: { x: string; y: string };
  impact_score: number; // -10 to 10 scale
  status: 'High Benefit' | 'Moderate Benefit' | 'Neutral' | 'Moderate Risk' | 'High Risk';
  key_metrics: { label: string; value: string; trend: 'up' | 'down' | 'stable' }[];
  summary: string;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

export interface KPIDetail {
  value: string;
  trend: 'up' | 'down' | 'stable';
  drivers: { factor: string; contribution: string; note: string }[];
  risks: string[];
}

export interface StakeholderImpact {
  group: string;
  impact: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
}

export interface IndicatorGroup {
  summary: string;
  indicators: Indicator[];
}

export interface Indicator {
  name: string;
  value: string;
  change: string;
  trend: 'positive' | 'negative' | 'neutral' | 'risk';
}

export interface Assumption {
  id: string;
  description: string;
  confidence: number; // 0 to 100
}

export interface SDGAlignment {
  sdg_id: number;
  sdg_name: string;
  impact_score: 'positive' | 'mixed' | 'negative';
  justification: string;
}
