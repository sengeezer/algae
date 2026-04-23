export type Difficulty = "Easy" | "Medium" | "Hard";

export type InterviewFrequency = "Very High" | "High" | "Medium";

export type CodeLanguage = "JavaScript" | "TypeScript";

export interface ComplexityProfile {
  time: string;
  space: string;
  notes: string;
}

export interface WorkedExample {
  title: string;
  input: string;
  output: string;
  explanation: string;
}

export interface CodeVariant {
  label: string;
  language: CodeLanguage;
  code: string;
}

export interface AlgorithmEntry {
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  dataStructures: string[];
  techniques: string[];
  difficulty: Difficulty;
  interviewFrequency: InterviewFrequency;
  aliases: string[];
  useCases: string[];
  complexity: ComplexityProfile;
  interviewSignals: string[];
  followUps: string[];
  pitfalls: string[];
  workedExamples: WorkedExample[];
  codeVariants: CodeVariant[];
  relatedSlugs: string[];
}

export interface CatalogFilters {
  query: string;
  structure: string;
  technique: string;
  difficulty: Difficulty | "";
  status: "all" | "bookmarked" | "completed";
}