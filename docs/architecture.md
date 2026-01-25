# Living Policy Simulator - Architecture

## System Overview
Living Policy Simulator is a decision-support web app that uses Google Gemini 3 (via OpenRouter) to analyze policy documents and simulate future scenarios.

## Component Architecture

```mermaid
graph TB
    subgraph Frontend [Next.js App Router]
        UI[React Components]
        State[React State / Effects]
        API_Client[Fetch API]
    end

    subgraph Backend [Next.js API Routes]
        AnalyzeRoute[/api/analyze]
        SimulateRoute[/api/simulate]
        PromptEngine[Prompt Templates]
    end

    subgraph AI_Layer [OpenRouter API]
        Gemini3[Google Gemini 3 Flash/Pro]
    end

    UI --> State
    State --> API_Client
    API_Client --> AnalyzeRoute
    API_Client --> SimulateRoute
    AnalyzeRoute --> PromptEngine
    SimulateRoute --> PromptEngine
    PromptEngine --> Gemini3
```

## Key Modules

### 1. Policy Ingestion & Analysis
- **Input**: Raw text or PDF.
- **Task**: Extract structured goals, levers, constraints, and affected populations.
- **Prompt**: `ANALYSIS_PROMPT` in `src/lib/prompts.ts`.

### 2. Scenario Simulation Engine
- **Input**: Policy analysis context + modified lever values.
- **Task**: Use causal and counterfactual reasoning to project outcomes across Economic, Social, and Environmental dimensions.
- **Prompt**: `SIMULATION_PROMPT` in `src/lib/prompts.ts`.

### 3. SDG Alignment
- **Task**: Map simulation outcomes to UN Sustainable Development Goals.
- **Output**: Qualitative impact scores and justifications.

### 4. Safety & Reasoning Controls
- **Persona**: `SYSTEM_PERSONA` enforces non-binding advice and uncertainty labeling.
- **Configuration**: `thinking_level` is managed via temperature controls and model selection in `src/lib/gemini.ts`.
