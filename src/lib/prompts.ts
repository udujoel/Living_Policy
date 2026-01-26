export const SYSTEM_PERSONA = `You are Living Policy Simulator, an AI decision‑support system designed to help users explore the potential impacts of public policy proposals before they are implemented. You analyze policy documents, datasets, and images; identify key assumptions, goals, constraints, and affected populations; simulate alternative futures; explain trade‑offs across economic, social, and environmental dimensions; and present outcomes as plausible scenarios, not hard predictions.

Do not provide legal, financial, or binding policy advice.
Do not claim predictions or guarantees; only discuss plausible scenarios and clearly label uncertainty.
Always include a section "Assumptions & Limitations".`;

export const ANALYSIS_PROMPT = `Analyze the following policy document and extract key structured information.
Return a JSON object with the following structure:
{
  "title": "Title of the policy",
  "summary": "Short natural-language Policy Summary",
  "goals": [
    { "id": "g1", "title": "Goal title", "metric": "Target metric", "target_deadline": "optional date", "source_para": "optional source ref" }
  ],
  "levers": [
    { "id": "l1", "name": "Lever name", "description": "What it controls", "current_value": "current value from text", "unit": "%, $, etc.", "type": "percentage|currency|numeric|boolean|text" }
  ],
  "constraints": [
    { "id": "c1", "type": "budget|legal|geographic|other", "description": "Constraint details" }
  ],
  "populations": ["Affected population 1", ...],
  "sectors": ["Affected sector 1", ...]
}

Policy Text:
{{policyText}}`;

export const SIMULATION_PROMPT = `Based on the policy analysis and the following lever values, simulate a scenario and its outcomes.
Use causal and counterfactual reasoning. Trace second-order effects from economic to social to environmental dimensions.

Current Lever Settings:
{{levers}}

Return a JSON object with the following structure:
{
  "scenario_id": "unique-id",
  "name": "Scenario Name (e.g. Baseline or High Investment)",
  "reasoning_summary": "A concise chain-of-thought summary explaining the causal links between the lever changes and the major outcomes.",
  "outcomes": {
    "economic": {
      "summary": "Economic outcome summary",
      "indicators": [
        { "name": "GDP Growth", "value": "+1.2%", "change": "up", "trend": "positive" }
      ]
    },
    "social": {
      "summary": "Social outcome summary",
      "indicators": [
        { "name": "Equity Index", "value": "78/100", "change": "+5", "trend": "positive" }
      ]
    },
    "environmental": {
      "summary": "Environmental outcome summary",
      "indicators": [
        { "name": "Carbon Offset", "value": "200kt", "change": "+10%", "trend": "positive" }
      ]
    }
  },
  "timeline_events": [
    { "year": "2025", "title": "Implementation Phase", "description": "Key event description..." },
    { "year": "2030", "title": "Maturity Phase", "description": "Key event description..." }
  ],
  "kpis": {
    "economic_growth": { 
      "value": "+4.2%", 
      "trend": "up", 
      "drivers": [{"factor": "Renewable Investment", "contribution": "+1.8%", "note": "Direct capital injection"}], 
      "risks": ["Inflationary pressure", "Supply chain bottlenecks"] 
    },
    "carbon_emissions": { 
      "value": "-40%", 
      "trend": "down", 
      "drivers": [{"factor": "Coal Phase-out", "contribution": "-25%", "note": "Plant closures"}], 
      "risks": ["Grid instability"] 
    },
    "employment": { 
      "value": "+12,000", 
      "trend": "up", 
      "drivers": [{"factor": "Green Jobs", "contribution": "+8,000", "note": "Installation & Maintenance"}], 
      "risks": ["Skills mismatch"] 
    }
  },
  "stakeholder_impacts": [
    { "group": "Energy Sector Workers", "impact": "High displacement risk but retraining opportunities available.", "sentiment": "mixed" },
    { "group": "Urban Consumers", "impact": "Short-term price increase, long-term stability.", "sentiment": "neutral" }
  ],
  "short_term_impact": "1-3 year horizon analysis",
  "long_term_impact": "5-10+ year horizon analysis",
  "trade_offs": ["Trade-off 1", "Trade-off 2"],
  "second_order_effects": ["Effect 1", "Effect 2"],
  "assumptions": [
    { "id": "a1", "description": "Key assumption", "confidence": 85 }
  ],
  "sdg_alignment": [
    { "sdg_id": 13, "sdg_name": "Climate Action", "impact_score": "positive", "justification": "One sentence justification." }
  ],
  "regional_analysis": [
    { 
      "region_name": "Urban Core", 
      "coordinates": { "x": "35%", "y": "42%" }, 
      "impact_score": 8, 
      "status": "High Benefit", 
      "key_metrics": [{ "label": "Econ Lift", "value": "+14%", "trend": "up" }], 
      "summary": "Impact summary..." 
    },
    { 
      "region_name": "Suburban Ring", 
      "coordinates": { "x": "62%", "y": "58%" }, 
      "impact_score": -2, 
      "status": "Moderate Risk", 
      "key_metrics": [{ "label": "Housing Cost", "value": "+5%", "trend": "up" }], 
      "summary": "Impact summary..." 
    },
    { 
      "region_name": "Industrial District", 
      "coordinates": { "x": "48%", "y": "25%" }, 
      "impact_score": 5, 
      "status": "Moderate Benefit", 
      "key_metrics": [{ "label": "Jobs", "value": "+200", "trend": "up" }], 
      "summary": "Impact summary..." 
    },
    { 
      "region_name": "Rural Outskirts", 
      "coordinates": { "x": "75%", "y": "30%" }, 
      "impact_score": 0, 
      "status": "Neutral", 
      "key_metrics": [{ "label": "Transport", "value": "0%", "trend": "stable" }], 
      "summary": "Impact summary..." 
    }
  ],
  "external_data_sources": [
    { "source": "World Bank API", "metric": "Gini Index", "year": "2023", "value": "32.4", "url": "https://data.worldbank.org/" }
  ],
  "causal_graph": {
    "nodes": [
      { "id": "n1", "label": "Carbon Tax", "type": "policy" },
      { "id": "n2", "label": "Industrial Cost", "type": "factor" },
      { "id": "n3", "label": "Emissions", "type": "outcome" }
    ],
    "edges": [
      { "source": "n1", "target": "n2", "strength": 0.8, "description": "Direct financial burden" },
      { "source": "n2", "target": "n3", "strength": -0.6, "description": "Efficiency incentive" }
    ]
  }
}

Policy Analysis Context:
{{analysisContext}}`;
