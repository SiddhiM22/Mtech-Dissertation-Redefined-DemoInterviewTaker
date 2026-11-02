export interface ScoreItem {
  question_id: string;
  score: number;
  strengths: string[];
  areas_for_improvement: string[];
  actionable_tip: string;
  red_flags?: string[];
  hallmarks?: string[];
  source?: string;
}

export interface RubricItem {
  id: string;
  text: string;
  competencies: string[];
  expected_keywords: string[];
  target_len_words: [number, number];
  category: string;
}

export type RoleFocus = "SWE" | "HR";

export interface SampleResume {
  id: string;
  name: string;
  role: RoleFocus;
  description: string;
  content: string;
}
