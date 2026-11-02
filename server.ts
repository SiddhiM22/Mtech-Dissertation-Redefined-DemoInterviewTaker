import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;
const HOST = "0.0.0.0";

app.use(cors());
app.use(express.json({ limit: "25mb" }));

// Server-side Gemini client initialization
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Predefined rubrics from original dissertation Feedback_Generation/app/rubrics.py
const PREDEFINED_RUBRICS = [
  {
    id: "q1",
    text: "Tell me about a time you handled a team conflict.",
    competencies: ["communication", "conflict-resolution", "empathy"],
    expected_keywords: ["situation", "task", "action", "result", "stakeholder", "resolved"],
    target_len_words: [120, 300],
    category: "Behavioral & Conflict Resolution",
  },
  {
    id: "q2",
    text: "Describe a situation where you took initiative to improve a process.",
    competencies: ["ownership", "initiative", "impact"],
    expected_keywords: ["baseline", "bottleneck", "metrics", "action", "impact", "learn"],
    target_len_words: [120, 300],
    category: "Leadership & Initiative",
  },
  {
    id: "q3",
    text: "How do you prioritize tasks when everything is important?",
    competencies: ["prioritization", "decision-making", "communication"],
    expected_keywords: ["framework", "trade-off", "stakeholders", "deadline", "risk", "impact"],
    target_len_words: [100, 250],
    category: "Decision Making & Prioritization",
  },
];

// Fallback generators for reliable operation even before API key is provided
function generateFallbackSummary(text: string): string[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 20 && !l.startsWith("http") && !l.includes("@"));

  if (lines.length >= 6) {
    return lines.slice(0, 8);
  }

  return [
    "Full-cycle experience in modern software engineering and systems architecture",
    "Proficient in TypeScript, React, Node.js microservices, and RESTful API design",
    "Implemented automated CI/CD deployment pipelines reducing release turnaround by 40%",
    "Led cross-functional sprint planning, backlog grooming, and technical mentorship for junior devs",
    "Designed and tuned scalable relational and document databases with high availability",
    "Spearheaded HR technical recruitment screening and structured behavioral rubric design",
  ];
}

function generateFallbackQuestions(summaryLines: string[]): string[] {
  const templates = [
    (item: string) => `Can you describe a specific project where you applied your experience in: "${item.slice(0, 60)}..."? What was the outcome?`,
    (item: string) => `When facing technical or organizational roadblocks related to "${item.slice(0, 50)}...", how did you navigate stakeholders to reach consensus?`,
    (item: string) => `Walk me through your methodology when executing "${item.slice(0, 50)}...". What key performance metrics did you track?`,
    (item: string) => `Tell me about a time you encountered an unexpected failure or conflict while working on "${item.slice(0, 50)}...". How did you resolve it?`,
    (item: string) => `How do you ensure maintainability, scalability, and quality standards when managing "${item.slice(0, 50)}..."?`,
    (item: string) => `Describe a situation where you mentored team members or collaborated cross-functionally regarding "${item.slice(0, 50)}...".`,
  ];

  return summaryLines.slice(0, 6).map((line, idx) => {
    const fn = templates[idx % templates.length];
    return fn(line);
  });
}

function generateFallbackFeedback(question: string, answer: string) {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lower = answer.toLowerCase();

  const hasSituation = lower.includes("situation") || lower.includes("when") || lower.includes("time") || lower.includes("at my previous");
  const hasTask = lower.includes("task") || lower.includes("responsible") || lower.includes("goal") || lower.includes("needed to");
  const hasAction = lower.includes("action") || lower.includes("i implemented") || lower.includes("i created") || lower.includes("i decided") || lower.includes("i built");
  const hasResult = lower.includes("result") || lower.includes("outcome") || lower.includes("increased") || lower.includes("reduced") || lower.includes("improved") || lower.includes("%");

  const starCount = [hasSituation, hasTask, hasAction, hasResult].filter(Boolean).length;
  let score = 5;
  if (wordCount < 25) {
    score = 3;
  } else if (wordCount > 60 && starCount >= 3) {
    score = 8;
  } else if (wordCount > 90 && starCount === 4) {
    score = 9;
  } else if (wordCount >= 40) {
    score = 6;
  }

  const strengths: string[] = [];
  const areasForImprovement: string[] = [];
  const hallmarks: string[] = [];
  const redFlags: string[] = [];

  if (hasAction) strengths.push("Clearly outlined direct personal actions and ownership.");
  if (hasResult) strengths.push("Included tangible results or positive outcomes.");
  if (wordCount >= 50) strengths.push("Provided a detailed narrative with technical context.");

  if (!hasResult) areasForImprovement.push("Highlight quantitative outcomes or measurable business impact (e.g. percentages, turnaround time).");
  if (!hasSituation) areasForImprovement.push("Set up the initial context and problem background more clearly using the STAR framework.");
  if (wordCount < 40) areasForImprovement.push("Elaborate on your personal contribution rather than general team accomplishments.");

  if (starCount >= 3) hallmarks.push("Demonstrated structured STAR method communication.");
  if (hasResult) hallmarks.push("Results-oriented mindset with business impact.");

  if (wordCount < 15) redFlags.push("Answer is too brief to evaluate competency.");

  return {
    question_id: "dynamic_q",
    score,
    strengths: strengths.length ? strengths : ["Addresses the core premise of the question."],
    areas_for_improvement: areasForImprovement.length ? areasForImprovement : ["Consider expanding on long-term learnings and retrospectives."],
    actionable_tip: hasResult
      ? "Strong response! Consider concluding with what you would do differently in hindsight."
      : "Structure your response using the STAR method (Situation, Task, Action, Result) to maximize impact.",
    red_flags: redFlags,
    hallmarks: hallmarks.length ? hallmarks : ["Direct response to prompt"],
  };
}

// ---- API Routes ----

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    hasApiKey: Boolean(apiKey),
    model: "gemini-3.8-flash",
  });
});

// Predefined rubrics endpoint
app.get("/api/rubrics", (_req: Request, res: Response) => {
  res.json({ rubrics: PREDEFINED_RUBRICS });
});

// Resume parsing and summarization endpoint
app.post("/api/resume/parse", async (req: Request, res: Response) => {
  const { resumeText, roleFocus } = req.body;

  if (!resumeText || typeof resumeText !== "string" || !resumeText.trim()) {
    res.status(400).json({ error: "resumeText is required." });
    return;
  }

  if (!ai) {
    const summary = generateFallbackSummary(resumeText);
    res.json({
      summaryLines: summary,
      source: "local-parser",
      note: "Using dissertation parsing heuristics. Configure GEMINI_API_KEY for deep LLM analysis.",
    });
    return;
  }

  try {
    const focusDescription = roleFocus === "HR" 
      ? "Human Resources (HR), Talent Acquisition, People Operations, and Behavioral Competencies"
      : "Software Engineering (SWE), Full-Stack Systems, Architecture, and Technical Problem Solving";

    const prompt = `
You are an expert resume analyst. Your ONLY task is to extract summary points relevant to ${focusDescription} from the provided resume text.

Rules:
- Return exactly 8 to 12 concise, factual, high-impact bullet summary lines.
- Each line must describe an actual skill, project achievement, leadership action, or experience.
- Do NOT include numbering, bullet symbols (*, -, •), or markdown formatting.
- One statement per line.

Resume Text:
"""
${resumeText.slice(0, 15000)}
"""
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    const outputText = response.text || "";
    const lines = outputText
      .split(/\r?\n/)
      .map((l) => l.replace(/^[-*•\d.)\s]+/, "").trim())
      .filter((l) => l.length > 10);

    const summaryLines = lines.length >= 4 ? lines.slice(0, 12) : generateFallbackSummary(resumeText);

    res.json({
      summaryLines,
      source: "gemini-3.8-flash",
    });
  } catch (error: any) {
    console.error("Error in resume parsing:", error);
    const summary = generateFallbackSummary(resumeText);
    res.json({
      summaryLines: summary,
      source: "fallback-heuristics",
      error: error?.message || "Failed to call Gemini API, used fallback summary.",
    });
  }
});

// Question generation endpoint
app.post("/api/questions/generate", async (req: Request, res: Response) => {
  const { summaryLines, domain = "SWE" } = req.body;

  if (!Array.isArray(summaryLines) || summaryLines.length === 0) {
    res.status(400).json({ error: "summaryLines array is required." });
    return;
  }

  const validLines = summaryLines.filter((l: any) => typeof l === "string" && l.trim().length > 10).slice(0, 6);

  if (!ai) {
    const questions = generateFallbackQuestions(validLines);
    res.json({
      questions,
      source: "local-generator",
    });
    return;
  }

  try {
    const prompt = `
You are an expert ${domain === "HR" ? "HR Manager and Behavioral Interviewer" : "Technical Lead and Software Engineering Hiring Manager"}.
Based on the following resume summary statements, generate ONE challenging, open-ended interview question for each line (up to ${validLines.length} questions).

Rules:
- Focus on situational, behavioral (STAR method), and technical depth.
- For each summary line, formulate a question that asks for specific examples, trade-offs, architecture decisions, or conflict resolution.
- Return ONLY a JSON array of strings containing the questions.

Resume Summary Points:
${validLines.map((line: string, i: number) => `${i + 1}. ${line}`).join("\n")}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      },
    });

    const parsedQuestions = JSON.parse(response.text || "[]");
    const questions = Array.isArray(parsedQuestions) && parsedQuestions.length > 0
      ? parsedQuestions
      : generateFallbackQuestions(validLines);

    res.json({
      questions,
      source: "gemini-3.8-flash",
    });
  } catch (error: any) {
    console.error("Error generating questions:", error);
    const questions = generateFallbackQuestions(validLines);
    res.json({
      questions,
      source: "fallback-heuristics",
      error: error?.message,
    });
  }
});

// Dynamic Feedback Endpoint
app.post("/api/feedback/dynamic", async (req: Request, res: Response) => {
  const { question_text, answer_text, rubric_id } = req.body;

  if (!question_text || !answer_text) {
    res.status(400).json({ error: "question_text and answer_text are required." });
    return;
  }

  const cleanAnswer = answer_text.trim();
  if (cleanAnswer.length < 5) {
    res.json({
      question_id: rubric_id || "dynamic_q",
      score: 1,
      strengths: [],
      areas_for_improvement: ["Answer is too short to evaluate. Please provide a more complete explanation."],
      actionable_tip: "Expand on the specific context, actions you personally took, and outcomes achieved.",
      red_flags: ["Extremely brief or empty response"],
      hallmarks: [],
    });
    return;
  }

  if (!ai) {
    const fallback = generateFallbackFeedback(question_text, cleanAnswer);
    res.json({
      ...fallback,
      question_id: rubric_id || "dynamic_q",
      source: "local-rubric-engine",
    });
    return;
  }

  try {
    const systemPrompt = `
You are an expert AI hiring assistant and senior hiring manager.
Your task is to evaluate a candidate's answer based on the interview question asked.

Calibrate scores on a 0-10 integer scale:
- 9-10: Exceptional, well-structured (clear Situation, Task, Action, Result), measurable business/technical outcomes, strong ownership.
- 7-8: Solid response, good depth, minor gaps in metrics or self-reflection.
- 5-6: Average, lacks clarity, generalities instead of specific actions, or missing results.
- 3-4: Weak, vague, misses the core premise, or defensive tone.
- 0-2: Unacceptable, off-topic, or empty.

Always provide constructive, actionable, professional feedback adhering strictly to the schema.
`;

    const userPrompt = `
Question Asked:
"${question_text}"

Candidate's Answer:
"${cleanAnswer}"

Provide evaluation as JSON matching the schema.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question_id: { type: Type.STRING },
            score: { type: Type.INTEGER, description: "Score from 0 to 10" },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "What the candidate did well",
            },
            areas_for_improvement: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Actionable points where the candidate can improve",
            },
            actionable_tip: {
              type: Type.STRING,
              description: "A single concise, high-impact piece of advice for the candidate",
            },
            red_flags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Any warning signs (e.g. avoided the question, blamed colleagues)",
            },
            hallmarks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Positive signals (e.g. STAR method used, metrics cited, ownership displayed)",
            },
          },
          required: ["question_id", "score", "strengths", "areas_for_improvement", "actionable_tip"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({
      question_id: rubric_id || parsed.question_id || "dynamic_q",
      score: typeof parsed.score === "number" ? Math.min(Math.max(parsed.score, 0), 10) : 6,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ["Clear answer addressing the prompt"],
      areas_for_improvement: Array.isArray(parsed.areas_for_improvement) ? parsed.areas_for_improvement : [],
      actionable_tip: parsed.actionable_tip || "Structure your answer using the STAR method for maximum clarity.",
      red_flags: Array.isArray(parsed.red_flags) ? parsed.red_flags : [],
      hallmarks: Array.isArray(parsed.hallmarks) ? parsed.hallmarks : [],
      source: "gemini-3.8-flash",
    });
  } catch (error: any) {
    console.error("Error generating feedback:", error);
    const fallback = generateFallbackFeedback(question_text, cleanAnswer);
    res.json({
      ...fallback,
      question_id: rubric_id || "dynamic_q",
      source: "fallback-heuristics",
      error: error?.message,
    });
  }
});

// Setup Vite middleware in dev or static in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile("index.html", { root: "dist" });
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Server listening on http://${HOST}:${PORT}`);
  });
}

startServer();
