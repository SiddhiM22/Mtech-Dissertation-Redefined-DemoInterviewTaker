import React, { useState } from "react";
import { MessageSquare, Send, Sparkles, Check, RefreshCw } from "lucide-react";
import { ScoreItem } from "../types";
import { FeedbackCard } from "./FeedbackCard";

interface QuestionCardProps {
  index: number;
  question: string;
  feedback?: ScoreItem;
  onSubmitAnswer: (index: number, question: string, answer: string) => Promise<void>;
  isSubmitting: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  index,
  question,
  feedback,
  onSubmitAnswer,
  isSubmitting,
}) => {
  const [answer, setAnswer] = useState("");
  const [hasSubmittedLocally, setHasSubmittedLocally] = useState(false);

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    setHasSubmittedLocally(true);
    await onSubmitAnswer(index, question, answer);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-all hover:shadow-md hover:border-slate-300 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-2.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <MessageSquare className="w-3.5 h-3.5" />
            Question {index + 1}
          </span>
          {feedback && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <Check className="w-3.5 h-3.5" /> Evaluated
            </span>
          )}
        </div>

        {/* Question Text */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-sm font-semibold text-slate-900 leading-snug mb-4">
          {question}
        </div>

        {/* Answer Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <label htmlFor={`answer-${index}`} className="font-medium text-slate-700">
                Your Answer:
              </label>
              <span>{wordCount} words</span>
            </div>
            <textarea
              id={`answer-${index}`}
              rows={4}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Structure your answer using the STAR method: Situation, Task, Action you took, and measurable Results..."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-600 italic">
              Tip: Include specific metrics and personal ownership
            </span>
            <button
              type="submit"
              disabled={isSubmitting || !answer.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{feedback ? "Re-evaluate Answer" : "Get Feedback"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Render Feedback if present */}
      {feedback && <FeedbackCard feedback={feedback} />}
    </div>
  );
};
