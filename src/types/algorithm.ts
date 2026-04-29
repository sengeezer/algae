export type Difficulty = "Easy" | "Medium" | "Hard";

export type InterviewFrequency = "Very High" | "High" | "Medium";

export type CodeLanguage = "JavaScript" | "TypeScript";

export type ProvenanceKind = "Implementation" | "Reference";

export interface ComplexityProfile {
  time: string;
  space: string;
  notes: string;
}

export interface AlgorithmProvenance {
  title: string;
  href: string;
  kind: ProvenanceKind;
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
  relatedSlugs: string[];
  provenance: AlgorithmProvenance[];
  body: string;
}

export interface CatalogFilters {
  query: string;
  structure: string;
  technique: string;
  difficulty: Difficulty | "";
  status: "all" | "bookmarked" | "completed";
}