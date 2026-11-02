# AI/ML-Based Hiring Process Automation

An automated hiring and interview prep framework that combines intelligent resume analysis, dynamic interview-question generation, and AI-powered rubric answer scoring and feedback.

Rewritten from the original dissertation prototype into a modern, full-stack React and Node.js application powered by the Google Gemini API.

## Features

- **Multi-Format Resume Ingestion**: Upload resumes in PDF, DOCX, or TXT format, or select pre-configured Software Engineering (SWE) and Human Resources (HR) samples with 1-click.
- **Role-Calibrated Summarization**: Extracts 8–12 concise, factual summary points focusing on technical and behavioral achievements.
- **Dynamic Question Generation**: Generates contextual, open-ended technical and behavioral interview questions tailored to each summary point.
- **Interactive Practice & Calibrated Scoring**: Candidates submit answers and receive instant, structured feedback:
  - 10-point calibrated score
  - Actionable improvement tips
  - Specific strengths and growth areas
  - STAR method hallmarks (Situation, Task, Action, Result)
  - Potential red flags or omissions
- **STAR Benchmark Practice**: Interactive practice on standardized behavioral interview rubrics (Conflict Resolution, Process Initiative, Task Prioritization).
- **Candidate Evaluation Scorecard**: Aggregated interview performance report with readiness index and one-click summary export.

## Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide icons, in-browser PDF extraction.
- **Backend**: Express server with Vite middleware, `@google/genai` SDK integration using `gemini-3.8-flash`.
- **Heuristic Fallback Engine**: Built-in rubric evaluation and question synthesis heuristics ensuring high reliability and offline testability.

## Development

```bash
npm install
npm run dev
```

The application runs on port 3000 (`http://localhost:3000`).
