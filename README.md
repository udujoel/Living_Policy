# Living Policy Simulator

A hackathon project for the **Gemini 3 Hackathon: Build what’s next.**

Living Policy Simulator is an AI decision-support web app that turns static public policy documents into interactive, explorable future scenarios. It uses Google Gemini 3 (via OpenRouter) to analyze policy proposals and simulate their multidimensional impacts.

## Live Demo

[living-policy.vercel.app](https://living-policy.vercel.app)

## Features

- **Policy Ingestion**: Extract goals, levers, constraints, and stakeholders from raw text or PDFs.
- **Dynamic Scenarios**: Use sliders and toggles to adjust policy "levers" and see real-time simulated impacts.
- **Causal Reasoning**: Gemini 3 projects outcomes across Economic, Social, and Environmental dimensions using second-order effect analysis.
- **SDG Alignment**: Automatically map policy outcomes to UN Sustainable Development Goals.
- **Stitch UI Design**: A clean, responsive interface inspired by Google's Stitch design system.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion.
- **Backend**: Next.js API Routes.
- **AI**: Google Gemini 3 (via OpenRouter API).
- **UI Components**: Radix UI, Lucide Icons.

## Getting Started

### Prerequisites

- Node.js 18+
- An OpenRouter API Key (with access to Gemini 3 models)

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env.local`.
   - Add your `OPENROUTER_API_KEY`.
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3001](http://localhost:3001) in your browser.

## Project Structure

- `src/app/api`: Backend routes for analysis and simulation.
- `src/lib/gemini.ts`: OpenRouter client and model configuration.
- `src/lib/prompts.ts`: Reusable prompt templates with system personas.
- `src/components`: Modular UI components (UploadPanel, OutcomeView, etc.).
- `docs/architecture.md`: Detailed system architecture and data flow.

## Gemini 3 Integration

This app leverages the improved reasoning and latency of **Gemini 3 Flash/Pro**.

- **Context Handling**: Gemini 3 analyzes long policy documents to extract structured metadata.
- **Counterfactual Reasoning**: The simulation engine asks "What if X changed?" to generate plausible futures.
- **Thinking Levels**: Configured via temperature and system prompts to balance quick summaries with deep causal analysis.

## Disclaimer

This tool is an AI-based simulator for educational exploration only. It is not legal, financial, or policy advice.
