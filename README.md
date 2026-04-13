# Medikly: Clinical Intelligence Dashboard

Medikly is a modern Next.js analytics platform for community clinic teams to monitor symptom trends, detect seasonal risk patterns, generate AI-supported observations, and export clinical summary reports.

It combines an interactive dashboard, trend analysis views, a medical knowledge base, and file-based data ingestion so teams can move from raw symptom counts to actionable decisions quickly.

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Runtime-339933?logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2023-F7DF1E?logo=javascript&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![MUI](https://img.shields.io/badge/MUI-Core-007FFF?logo=mui&logoColor=white)
![MUI X Charts](https://img.shields.io/badge/MUI_X-Charts-0A66C2?logo=mui&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-Visualization-FF6B6B)
![Google Gemini API](https://img.shields.io/badge/Gemini-AI_Insights-4285F4?logo=google&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-Code_Quality-4B32C3?logo=eslint&logoColor=white)

## Why This Project Exists

Small and medium clinic teams often have symptom data but no clear way to:

- identify monthly or seasonal surges
- compare symptom behavior over time
- map recurring symptom patterns to likely conditions
- convert raw numbers into concise operational guidance

Medikly addresses this by providing one UI for monitoring, pattern detection, and report generation.

## Core Features

- Dashboard KPIs for total cases, dominant symptoms, and peak month detection
- Symptom-level analysis with interactive trend and comparison charts
- Seasonal spike detection and heatmap-like intensity visualization
- AI Insights panel backed by Gemini (with graceful fallback when API key is missing)
- Upload workflow to replace live dataset with local JSON input
- Exportable plain-text clinical report with treatments from knowledge base
- Responsive page architecture with route-based modules

## Application Logic (How It Works)

### 1) Data Ingestion and Normalization

Most pages load:

- public/clinic_insight.json
- public/medical_knowledge.json

The app supports two symptom-data formats:

1. Aggregated object format
2. Record-array format

When record arrays are provided, pages normalize to:

- key: symptom name
- value: per-month counts

This lets all visualization pages share consistent chart input.

### 2) Forecast Heuristic

Dashboard forecasting logic estimates next-month symptom pressure by:

1. comparing last and previous month counts
2. projecting trend using current plus 1.5 times trend delta
3. scoring diseases by symptom overlap with projected counts
4. returning highest-scored disease and advice text

### 3) Clinical Correlation Engine

In AI Insights page, each disease from knowledge base is checked against symptom activity:

- symptom matches are case-insensitive
- confidence rises with monthly symptom volume
- results are sorted by confidence
- treatment and medicine fields are attached for display

### 4) Pattern and Spike Detection

Trends page computes:

- monthly totals
- symptom averages
- spikes where monthly count exceeds 1.5 times average and is at least 5
- high-level pattern flags (example: pyrexia and inflammation waves)

### 5) AI-Generated Insight Layer

The route app/api/ai-insights/route.js posts a short trend summary to Gemini Flash and returns concise bullets.

- If GEMINI_API_KEY is missing, it returns fallback insights instead of failing the UI.

### 6) Upload and Persistence Flow

Upload page validates JSON client-side, previews content, and sends payload to app/api/upload/route.js.

Server route writes data directly to public/clinic_insight.json, making new values live on next fetch cycle.

## Architecture Flow

```mermaid
flowchart LR
	A[User Visits Page] --> B[Client Fetches clinic_insight.json]
	A --> C[Client Fetches medical_knowledge.json]
	B --> D[Normalize Data Shape]
	C --> E[Knowledge Matching]
	D --> F[Charts and KPIs]
	D --> G[Spike and Trend Logic]
	E --> H[Condition Correlation]
	D --> I[AI Summary Builder]
	I --> J[/api/ai-insights]
	J --> K[Gemini Response or Fallback]
	K --> L[Insight Cards]
	M[Upload JSON] --> N[/api/upload]
	N --> O[Overwrite public/clinic_insight.json]
	O --> B
```

## Project Structure

```text
clinicpluse/
|-- app/
|   |-- about/
|   |   `-- page.js
|   |-- analysis/
|   |   `-- page.js
|   |-- api/
|   |   |-- ai-insights/
|   |   |   `-- route.js
|   |   `-- upload/
|   |       `-- route.js
|   |-- insights/
|   |   `-- page.js
|   |-- reports/
|   |   `-- page.js
|   |-- trends/
|   |   `-- page.js
|   |-- upload/
|   |   `-- page.js
|   |-- globals.css
|   |-- layout.js
|   `-- page.js
|-- components/
|   |-- AdvancedAnalytics.js
|   |-- MonthlyDiseaseAnalysis.js
|   |-- Sidebar.js
|   |-- SymptomHeatmap.js
|   `-- TreatmentNotes.js
|-- public/
|   |-- archive/
|   |   |-- Diseases_Symptoms.csv
|   |   `-- training_data.csv
|   |-- final/
|   |   `-- medical_knowledge.json
|   |-- clinic_insight.json
|   |-- medical_knowledge.json
|   `-- archive.zip
|-- analysis.ipynb
|-- generate_data.py
|-- eslint.config.mjs
|-- jsconfig.json
|-- next.config.mjs
|-- postcss.config.mjs
|-- package.json
`-- README.md
```

## Routes and Functional Responsibilities

- / : Overview dashboard, KPIs, and forecast card
- /analysis : Symptom deep dive with charts and condition association
- /trends : Heatmap matrix, seasonal spikes, and month comparisons
- /insights : AI-assisted correlation feed + treatment notes per condition
- /upload : JSON preview and confirmation flow for dataset update
- /reports : Report generation and download in TXT format
- /about : High-level methodology narrative

## API Endpoints

### POST /api/upload

Purpose:

- Persist uploaded JSON payload as public dataset

Behavior:

- request body: JSON in supported data shape
- writes to public/clinic_insight.json
- returns success/failure JSON

### POST /api/ai-insights

Purpose:

- Generate concise AI observations from summarized trend text

Behavior:

- request body expects dataSummary string
- uses GEMINI_API_KEY from environment
- returns up to 4 insights
- provides fallback insights when key is missing

## Data Contracts

### Supported Symptom Dataset Format A (Aggregated)

```json
{
	"Fever": {
		"January": 13,
		"February": 13,
		"March": 16,
		"April": 0
	},
	"Cough": {
		"January": 11,
		"February": 9,
		"March": 10,
		"April": 3
	}
}
```

### Supported Symptom Dataset Format B (Record Array)

```json
[
	{ "Symptom": "Fever", "Month": "January" },
	{ "Symptom": "Fever", "Month": "January" },
	{ "Symptom": "Cough", "Month": "February" }
]
```

### Knowledge Base Format

```json
{
	"diseases": [
		{
			"id": "disease-id",
			"name": "Disease Name",
			"symptoms": ["Symptom A", "Symptom B"],
			"curing": "Treatment strategy",
			"medicine": "Medication notes",
			"severity": "Medium"
		}
	]
}
```

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
npm install
```

### Configure Environment

Create .env.local in project root:

```bash
GEMINI_API_KEY=your_real_api_key
```

If GEMINI_API_KEY is not set, AI Insights still renders fallback content.

### Run Development Server

```bash
npm run dev
```

Open http://localhost:3000.

### Production Build

```bash
npm run build
npm run start
```

## Available Scripts

- npm run dev: Start local development server
- npm run build: Create production build
- npm run start: Run built production server
- npm run lint: Lint project with ESLint and Next rules

## Typical Usage Workflow

1. Start app and inspect baseline dashboard on /
2. Review symptom deep-dive in /analysis
3. Validate spike behavior in /trends
4. Generate AI observations in /insights
5. Upload refreshed dataset in /upload
6. Export human-readable report in /reports

## Notes and Limitations

- Upload route currently overwrites the entire dataset file.
- AI response formatting depends on model output quality.
- Report export is plain text (.txt), not PDF.
- The app is decision-support oriented and not a medical diagnosis system.

## Clinical Disclaimer

This project is for educational and operational analytics support. It does not replace licensed medical diagnosis, clinical judgment, or regulatory-compliant healthcare systems.

## Future Enhancements

- Add role-based auth for upload/report endpoints
- Add schema validation before writing uploaded payloads
- Add historical versioning for dataset snapshots
- Expand forecasting from heuristic rules to statistical models
- Add unit and integration tests for transformation logic
