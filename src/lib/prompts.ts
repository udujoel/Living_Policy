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
  "short_term_impact": "1-3 year horizon analysis",
  "long_term_impact": "5-10+ year horizon analysis",
  "trade_offs": ["Trade-off 1", "Trade-off 2"],
  "second_order_effects": ["Effect 1", "Effect 2"],
  "assumptions": [
    { "id": "a1", "description": "Key assumption", "confidence": 85 }
  ],
  "sdg_alignment": [
    { "sdg_id": 13, "sdg_name": "Climate Action", "impact_score": "positive", "justification": "One sentence justification." }
  ]
}

Policy Analysis Context:
{{analysisContext}}`;
