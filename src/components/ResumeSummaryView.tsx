import React from "react";
import { Check, Sparkles, RefreshCw, FileText, ChevronRight } from "lucide-react";
import { RoleFocus } from "../types";

interface ResumeSummaryViewProps {
  summaryLines: string[];
  roleFocus: RoleFocus;
  onGenerateQuestions: () => void;
  isGeneratingQuestions: boolean;
  onResetResume: () => void;
}

export const ResumeSummaryView: React.FC<ResumeSummaryViewProps> = ({
  summaryLines,
  roleFocus,
  onGenerateQuestions,
  isGeneratingQuestions,
  onResetResume,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Extracted Resume Summary Points
            </h2>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {summaryLines.length} points
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Key accomplishments and technical competencies curated for {roleFocus === "SWE" ? "Software Engineering" : "Human Resources"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetResume}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            Clear / New Resume
          </button>
          <button
            onClick={onGenerateQuestions}
            disabled={isGeneratingQuestions || summaryLines.length === 0}
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {isGeneratingQuestions ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Generating Questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Interview Questions</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {summaryLines.map((line, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/20 transition-all text-xs text-slate-800 leading-relaxed"
          >
            <div className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
              {idx + 1}
            </div>
            <span className="flex-1">{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
