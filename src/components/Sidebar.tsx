import React, { useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Sparkles, UserCheck, Code, Briefcase } from "lucide-react";
import { RoleFocus } from "../types";
import { SAMPLE_RESUMES } from "../data/sampleResumes";

interface SidebarProps {
  onFileUpload: (file: File) => void;
  onSelectSample: (sampleId: string) => void;
  roleFocus: RoleFocus;
  setRoleFocus: (role: RoleFocus) => void;
  currentFileName: string | null;
  isParsing: boolean;
  hasApiKey: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onFileUpload,
  onSelectSample,
  roleFocus,
  setRoleFocus,
  currentFileName,
  isParsing,
  hasApiKey,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <aside className="w-full lg:w-80 shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-5 space-y-6">
      {/* File Upload Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Upload Resume
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">PDF, DOCX, TXT</span>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            currentFileName
              ? "border-blue-300 bg-blue-50/50 hover:bg-blue-50"
              : "border-slate-300 hover:border-blue-400 bg-slate-50/70 hover:bg-slate-50"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-800">
            {currentFileName ? currentFileName : "Click or drag resume file here"}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Supports .pdf, .doc, .docx, .txt
          </p>
          {isParsing && (
            <p className="text-xs text-blue-600 font-medium mt-2 animate-pulse">
              Parsing resume content...
            </p>
          )}
        </div>
      </div>

      {/* Role Focus Domain */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Target Role Focus
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRoleFocus("SWE")}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
              roleFocus === "SWE"
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Software (SWE)</span>
          </button>

          <button
            type="button"
            onClick={() => setRoleFocus("HR")}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
              roleFocus === "HR"
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Human Res. (HR)</span>
          </button>
        </div>
      </div>

      {/* One-Click Sample Resumes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Quick Sample Resumes
          </label>
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        </div>
        <p className="text-[11px] text-slate-500 mb-2.5">
          Select a sample to explore without uploading your own resume:
        </p>

        <div className="space-y-2">
          {SAMPLE_RESUMES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample.id)}
              className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                  {sample.name}
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {sample.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                {sample.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* API Key Status Indicator */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-slate-600">Key loaded:</span>
          <span
            className={`font-bold inline-flex items-center gap-1 ${
              hasApiKey ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            {hasApiKey ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> YES
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5" /> Ready (Fallback Active)
              </>
            )}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          {hasApiKey
            ? "Gemini 3.8 Flash online for high-speed inference & rubric evaluation."
            : "Gemini server proxy active with built-in ML rubric fallback."}
        </p>
      </div>

      {/* Info Callout */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-[11px] text-blue-900 leading-relaxed">
        <p className="font-semibold mb-1 flex items-center gap-1 text-blue-800">
          <UserCheck className="w-3.5 h-3.5" /> Smart Parser Logic
        </p>
        This app uses hybrid parsing: text extraction & certification badge detection, followed by Q&A generation and STAR rubric scoring.
      </div>
    </aside>
  );
};
