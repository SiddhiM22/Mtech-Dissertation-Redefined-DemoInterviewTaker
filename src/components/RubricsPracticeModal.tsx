import React, { useState, useEffect } from "react";
import { X, BookOpen, Target, Sparkles, Send, RefreshCw, CheckCircle2 } from "lucide-react";
import { RubricItem, ScoreItem } from "../types";
import { FeedbackCard } from "./FeedbackCard";

interface RubricsPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitAnswer: (id: string, question: string, answer: string) => Promise<ScoreItem | null>;
}

export const RubricsPracticeModal: React.FC<RubricsPracticeModalProps> = ({
  isOpen,
  onClose,
  onSubmitAnswer,
}) => {
  const [rubrics, setRubrics] = useState<RubricItem[]>([]);
  const [selectedRubricId, setSelectedRubricId] = useState<string>("q1");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, ScoreItem>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/rubrics")
        .then((res) => res.json())
        .then((data) => {
          if (data.rubrics && data.rubrics.length > 0) {
            setRubrics(data.rubrics);
            setSelectedRubricId(data.rubrics[0].id);
          }
        })
        .catch((err) => console.error("Failed to load rubrics:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentRubric = rubrics.find((r) => r.id === selectedRubricId) || rubrics[0];
  const currentAnswer = currentRubric ? answers[currentRubric.id] || "" : "";
  const currentFeedback = currentRubric ? feedbacks[currentRubric.id] : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRubric || !currentAnswer.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await onSubmitAnswer(currentRubric.id, currentRubric.text, currentAnswer);
      if (res) {
        setFeedbacks((prev) => ({ ...prev, [currentRubric.id]: res }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Behavioral STAR Rubric Benchmark Practice
              </h3>
              <p className="text-xs text-slate-500">
                Standardized behavioral rubrics from the dissertation's Feedback Generation service
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2 overflow-x-auto">
          {rubrics.map((r, idx) => (
            <button
              key={r.id}
              onClick={() => setSelectedRubricId(r.id)}
              className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                selectedRubricId === r.id
                  ? "bg-white text-blue-600 border-blue-600 shadow-xs"
                  : "text-slate-600 border-transparent hover:text-slate-900"
              }`}
            >
              <span>{`Rubric Q${idx + 1}`}</span>
              {feedbacks[r.id] && (
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {currentRubric && (
            <>
              {/* Question card */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                    {currentRubric.category}
                  </span>
                  <span className="text-xs text-blue-700 font-medium">
                    Target: {currentRubric.target_len_words[0]}-{currentRubric.target_len_words[1]} words
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{currentRubric.text}</h4>

                {/* Rubric Competencies and Expected STAR Keywords */}
                <div className="pt-2 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] font-semibold text-slate-600 mr-1">
                    Evaluated Competencies:
                  </span>
                  {currentRubric.competencies.map((comp, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-300"
                    >
                      {comp}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1 items-center pt-1">
                  <span className="text-[11px] font-semibold text-slate-600 mr-1">
                    Expected STAR Indicators:
                  </span>
                  {currentRubric.expected_keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Answer Input */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <label className="font-semibold text-slate-700">Your Structured Response:</label>
                    <span>
                      {currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0} words
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={currentAnswer}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [currentRubric.id]: e.target.value }))
                    }
                    placeholder="Describe the Situation, the Task at hand, the Actions you directly executed, and the measurable Result..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !currentAnswer.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Evaluating Answer...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Score against Rubric</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Feedback Display */}
              {currentFeedback && <FeedbackCard feedback={currentFeedback} />}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
