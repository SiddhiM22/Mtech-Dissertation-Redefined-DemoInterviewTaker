import React from "react";
import { CheckCircle2, AlertTriangle, Lightbulb, ShieldAlert, Star, TrendingUp } from "lucide-react";
import { ScoreItem } from "../types";

interface FeedbackCardProps {
  feedback: ScoreItem;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback }) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-emerald-50 text-emerald-700 border-emerald-300";
    if (score >= 6) return "bg-blue-50 text-blue-700 border-blue-300";
    if (score >= 4) return "bg-amber-50 text-amber-700 border-amber-300";
    return "bg-rose-50 text-rose-700 border-rose-300";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 9) return "Exceptional";
    if (score >= 7) return "Solid & Well Structured";
    if (score >= 5) return "Average (Minor Gaps)";
    if (score >= 3) return "Needs Refinement";
    return "Insufficient";
  };

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-4">
      {/* Top Score Banner */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-lg border font-black text-sm tracking-tight ${getScoreColor(
              feedback.score
            )}`}
          >
            Score: {feedback.score} / 10
          </div>
          <span className="text-xs font-semibold text-slate-700">
            {getScoreLabel(feedback.score)}
          </span>
        </div>

        {feedback.source && (
          <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            Evaluator: {feedback.source}
          </span>
        )}
      </div>

      {/* Actionable Tip */}
      {feedback.actionable_tip && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900">
          <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Actionable Tip: </span>
            {feedback.actionable_tip}
          </div>
        </div>
      )}

      {/* Hallmarks & STAR Method Badges */}
      {feedback.hallmarks && feedback.hallmarks.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {feedback.hallmarks.map((h, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
            >
              <Star className="w-3 h-3 text-emerald-600" />
              {h}
            </span>
          ))}
        </div>
      )}

      {/* Strengths */}
      {feedback.strengths && feedback.strengths.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Key Strengths
          </h4>
          <ul className="space-y-1 pl-1">
            {feedback.strengths.map((str, i) => (
              <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas for Improvement */}
      {feedback.areas_for_improvement && feedback.areas_for_improvement.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            Areas for Improvement
          </h4>
          <ul className="space-y-1 pl-1">
            {feedback.areas_for_improvement.map((area, i) => (
              <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Red Flags */}
      {feedback.red_flags && feedback.red_flags.length > 0 && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200">
          <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5 mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            Flagged Items
          </h4>
          <ul className="space-y-0.5">
            {feedback.red_flags.map((rf, i) => (
              <li key={i} className="text-xs text-rose-700">
                - {rf}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
