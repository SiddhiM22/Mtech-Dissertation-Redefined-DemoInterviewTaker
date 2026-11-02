import React from "react";
import { Bot, Sparkles, BookOpen, Award, FileText } from "lucide-react";

interface HeaderProps {
  onOpenRubrics: () => void;
  onOpenReport: () => void;
  answeredCount: number;
  totalQuestions: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenRubrics,
  onOpenReport,
  answeredCount,
  totalQuestions,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-200">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                AI/ML Hiring Process Automation
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                MTech Dissertation
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">
              Resume Parsing • Question Generation • AI Rubric Answer Scoring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenRubrics}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-300"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>STAR Rubric Practice</span>
          </button>

          <button
            onClick={onOpenReport}
            disabled={answeredCount === 0}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              answeredCount > 0
                ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-xs cursor-pointer"
                : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>
              Evaluation Report ({answeredCount}/{totalQuestions})
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
