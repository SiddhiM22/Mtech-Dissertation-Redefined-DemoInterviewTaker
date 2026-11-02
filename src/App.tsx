import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { ResumeSummaryView } from "./components/ResumeSummaryView";
import { QuestionCard } from "./components/QuestionCard";
import { RubricsPracticeModal } from "./components/RubricsPracticeModal";
import { InterviewReportModal } from "./components/InterviewReportModal";
import { extractTextFromFile } from "./utils/pdfParser";
import { SAMPLE_RESUMES } from "./data/sampleResumes";
import { RoleFocus, ScoreItem } from "./types";
import { Sparkles, FileText, ArrowRight, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";

export function App() {
  const [roleFocus, setRoleFocus] = useState<RoleFocus>("SWE");
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [rawResumeText, setRawResumeText] = useState<string>("");
  const [summaryLines, setSummaryLines] = useState<string[]>([]);
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [feedbacks, setFeedbacks] = useState<Record<number, ScoreItem>>({});

  const [isParsing, setIsParsing] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [submittingIndex, setSubmittingIndex] = useState<number | null>(null);

  const [hasApiKey, setHasApiKey] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isRubricsModalOpen, setIsRubricsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Check backend health
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(data.hasApiKey);
      })
      .catch((err) => {
        console.error("Health check error:", err);
      });
  }, []);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setErrorMsg(null);
    setIsParsing(true);
    setCurrentFileName(file.name);
    setFeedbacks({});
    setGeneratedQuestions([]);
    setSummaryLines([]);

    try {
      const extractedText = await extractTextFromFile(file);
      if (!extractedText.trim()) {
        setErrorMsg("Could not extract readable text from the uploaded file.");
        setIsParsing(false);
        return;
      }
      setRawResumeText(extractedText);
      await parseResume(extractedText, roleFocus);
    } catch (err: any) {
      setErrorMsg(`Failed to parse file: ${err?.message || err}`);
    } finally {
      setIsParsing(false);
    }
  };

  // Handle sample resume selection
  const handleSelectSample = async (sampleId: string) => {
    const sample = SAMPLE_RESUMES.find((s) => s.id === sampleId);
    if (!sample) return;

    setErrorMsg(null);
    setCurrentFileName(sample.name);
    setRoleFocus(sample.role);
    setRawResumeText(sample.content);
    setFeedbacks({});
    setGeneratedQuestions([]);
    setSummaryLines([]);

    setIsParsing(true);
    try {
      await parseResume(sample.content, sample.role);
    } finally {
      setIsParsing(false);
    }
  };

  // Call backend to summarize resume
  const parseResume = async (text: string, focus: RoleFocus) => {
    setIsParsing(true);
    try {
      const res = await fetch("/api/resume/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: text, roleFocus: focus }),
      });
      const data = await res.json();
      if (data.summaryLines && data.summaryLines.length > 0) {
        setSummaryLines(data.summaryLines);
      } else {
        setErrorMsg("No summary lines were returned from the resume.");
      }
    } catch (err: any) {
      setErrorMsg(`Resume summarization error: ${err.message}`);
    } finally {
      setIsParsing(false);
    }
  };

  // Trigger question generation from summary lines
  const handleGenerateQuestions = async () => {
    if (summaryLines.length === 0) return;
    setErrorMsg(null);
    setIsGeneratingQuestions(true);
    setFeedbacks({});

    try {
      const res = await fetch("/api/questions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summaryLines,
          domain: roleFocus,
        }),
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setGeneratedQuestions(data.questions);
      } else {
        setErrorMsg("No interview questions could be generated.");
      }
    } catch (err: any) {
      setErrorMsg(`Question generation error: ${err.message}`);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Submit answer for evaluation
  const handleSubmitAnswer = async (index: number, question: string, answer: string) => {
    setSubmittingIndex(index);
    try {
      const res = await fetch("/api/feedback/dynamic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_text: question,
          answer_text: answer,
        }),
      });
      const data: ScoreItem = await res.json();
      setFeedbacks((prev) => ({ ...prev, [index]: data }));
    } catch (err: any) {
      setErrorMsg(`Evaluation error: ${err.message}`);
    } finally {
      setSubmittingIndex(null);
    }
  };

  // Rubric practice answer submission
  const handleRubricSubmit = async (id: string, question: string, answer: string): Promise<ScoreItem | null> => {
    try {
      const res = await fetch("/api/feedback/dynamic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_text: question,
          answer_text: answer,
          rubric_id: id,
        }),
      });
      return await res.json();
    } catch (err) {
      console.error("Rubric evaluation error:", err);
      return null;
    }
  };

  // Reset resume to start fresh
  const handleResetResume = () => {
    setCurrentFileName(null);
    setRawResumeText("");
    setSummaryLines([]);
    setGeneratedQuestions([]);
    setFeedbacks({});
  };

  const answeredCount = Object.keys(feedbacks).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header
        onOpenRubrics={() => setIsRubricsModalOpen(true)}
        onOpenReport={() => setIsReportModalOpen(true)}
        answeredCount={answeredCount}
        totalQuestions={generatedQuestions.length}
      />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          onFileUpload={handleFileUpload}
          onSelectSample={handleSelectSample}
          roleFocus={roleFocus}
          setRoleFocus={(rf) => {
            setRoleFocus(rf);
            if (rawResumeText) {
              parseResume(rawResumeText, rf);
            }
          }}
          currentFileName={currentFileName}
          isParsing={isParsing}
          hasApiKey={hasApiKey}
        />

        {/* Main Stage */}
        <main className="flex-1 p-5 lg:p-8 space-y-6">
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button
                onClick={() => setErrorMsg(null)}
                className="text-xs font-bold hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Empty State */}
          {!currentFileName && !isParsing && (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto my-12 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-xs">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                AI/ML Hiring Process Framework
              </h2>
              <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                Upload your resume (.pdf, .docx, or .txt) in the sidebar or select a pre-loaded sample resume to extract core competencies, generate customized interview questions, and receive AI answer feedback.
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <button
                  onClick={() => handleSelectSample("swe-fullstack")}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all text-xs group"
                >
                  <div className="flex items-center justify-between font-bold text-slate-800 group-hover:text-blue-700">
                    <span>Try SWE Engineer Resume</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-slate-500 mt-1">
                    Full-Stack distributed systems, AWS, microservices, and React.
                  </p>
                </button>

                <button
                  onClick={() => handleSelectSample("hr-talent-ops")}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all text-xs group"
                >
                  <div className="flex items-center justify-between font-bold text-slate-800 group-hover:text-blue-700">
                    <span>Try HR Talent Lead Resume</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-slate-500 mt-1">
                    Recruitment operations, conflict mediation, and STAR rubric design.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Parsing Spinner */}
          {isParsing && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto mb-4"></div>
              <h3 className="text-base font-bold text-slate-900">
                Analyzing Resume Content...
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Parsing text, inspecting certifications, and distilling {roleFocus} summary points.
              </p>
            </div>
          )}

          {/* Summary Points View */}
          {summaryLines.length > 0 && !isParsing && (
            <ResumeSummaryView
              summaryLines={summaryLines}
              roleFocus={roleFocus}
              onGenerateQuestions={handleGenerateQuestions}
              isGeneratingQuestions={isGeneratingQuestions}
              onResetResume={handleResetResume}
            />
          )}

          {/* Generating Questions Spinner */}
          {isGeneratingQuestions && (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-xs">
              <div className="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto mb-3"></div>
              <h3 className="text-sm font-bold text-slate-900">
                Generating Role-Relevant Questions...
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Formulating behavioral and technical interview questions based on your resume accomplishments.
              </p>
            </div>
          )}

          {/* Questions & Feedback Grid */}
          {generatedQuestions.length > 0 && !isGeneratingQuestions && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    Practice Your Answers
                  </h3>
                  <p className="text-xs text-slate-500">
                    Generated {generatedQuestions.length} relevant questions from your resume summary points.
                  </p>
                </div>

                {answeredCount > 0 && (
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    View Evaluation Scorecard ({answeredCount} completed)
                  </button>
                )}
              </div>

              {/* 2-Column layout matching original Streamlit columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                {generatedQuestions.map((q, idx) => (
                  <QuestionCard
                    key={idx}
                    index={idx}
                    question={q}
                    feedback={feedbacks[idx]}
                    onSubmitAnswer={handleSubmitAnswer}
                    isSubmitting={submittingIndex === idx}
                  />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Rubric Benchmark Modal */}
      <RubricsPracticeModal
        isOpen={isRubricsModalOpen}
        onClose={() => setIsRubricsModalOpen(false)}
        onSubmitAnswer={handleRubricSubmit}
      />

      {/* Evaluation Report Modal */}
      <InterviewReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        questions={generatedQuestions}
        feedbacks={feedbacks}
        roleFocus={roleFocus}
      />
    </div>
  );
}
export default App;
