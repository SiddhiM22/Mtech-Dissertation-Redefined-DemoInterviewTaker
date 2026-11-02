import React from "react";
import { X, Award, CheckCircle2, TrendingUp, Printer, Copy, Check } from "lucide-react";
import { ScoreItem } from "../types";

interface InterviewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: string[];
  feedbacks: Record<number, ScoreItem>;
  roleFocus: string;
}

export const InterviewReportModal: React.FC<InterviewReportModalProps> = ({
  isOpen,
  onClose,
  questions,
  feedbacks,
  roleFocus,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const feedbackList = Object.values(feedbacks);
  const totalScore = feedbackList.reduce((acc, curr) => acc + curr.score, 0);
  const avgScore = feedbackList.length ? (totalScore / feedbackList.length).toFixed(1) : "0.0";
  const numScore = parseFloat(avgScore);

  let readinessLevel = "Needs Practice";
  let readinessColor = "text-amber-600 bg-amber-50 border-amber-200";
  if (numScore >= 8) {
    readinessLevel = "Highly Ready for Final Rounds";
    readinessColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
  } else if (numScore >= 6) {
    readinessLevel = "Solid Candidate (Minor Coaching Needed)";
    readinessColor = "text-blue-700 bg-blue-50 border-blue-200";
  }

  const allStrengths = Array.from(new Set(feedbackList.flatMap((f) => f.strengths)));
  const allImprovements = Array.from(new Set(feedbackList.flatMap((f) => f.areas_for_improvement)));

  const handleCopyReport = () => {
    const reportText = `AI/ML HIRING PROCESS EVALUATION REPORT
Target Role: ${roleFocus === "SWE" ? "Software Engineering" : "Human Resources"}
Average Rubric Score: ${avgScore} / 10 (${readinessLevel})
Questions Evaluated: ${feedbackList.length}

KEY STRENGTHS:
${allStrengths.map((s) => `• ${s}`).join("\n")}

AREAS FOR IMPROVEMENT:
${allImprovements.map((i) => `• ${i}`).join("\n")}
`;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Candidate Evaluation Report
              </h3>
              <p className="text-xs text-slate-500">
                AI calibrated interview scoring across evaluated responses
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

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Readiness Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Average Score
              </span>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                {avgScore} <span className="text-sm font-normal text-slate-500">/ 10</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Questions Answered
              </span>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                {feedbackList.length} <span className="text-sm font-normal text-slate-500">/ {questions.length}</span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl border flex flex-col items-center justify-center text-center ${readinessColor}">
              <span className="text-[11px] font-semibold uppercase">Assessment</span>
              <span className="text-xs font-bold mt-1 text-slate-900">{readinessLevel}</span>
            </div>
          </div>

          {/* Aggregated Strengths */}
          {allStrengths.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Demonstrated Strengths
              </h4>
              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-1.5">
                {allStrengths.map((str, i) => (
                  <div key={i} className="text-xs text-slate-800 flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{str}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aggregated Improvements */}
          {allImprovements.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                Focus Areas for Real Interview
              </h4>
              <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 space-y-1.5">
                {allImprovements.map((imp, i) => (
                  <div key={i} className="text-xs text-slate-800 flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{imp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleCopyReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
