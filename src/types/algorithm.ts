export type Difficulty = "Easy" | "Medium" | "Hard";

export type InterviewFrequency = "Very High" | "High" | "Medium";

export type CodeLanguage = "JavaScript" | "TypeScript";

export type ProvenanceKind = "Implementation" | "Reference";

export type CatalogPrimaryTopic =
  | "Arrays & Matrices"
  | "Strings & Text"
  | "Linked Structures"
  | "Trees & Heaps"
  | "Graphs"
  | "Searching & Sorting"
  | "Dynamic Programming"
  | "Greedy"
  | "Backtracking & Recursion"
  | "Advanced Data Structures"
  | "Mathematics"
  | "Geometry"
  | "Systems & Utilities";

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

export interface AlgorithmGrouping {
  primaryTopic: CatalogPrimaryTopic;
  techniqueFamilies: string[];
}

export interface AlgorithmCatalogEntry {
  slug: string;
  title: string;
  category: string;
  grouping: AlgorithmGrouping;
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
}

export interface AlgorithmEntry extends AlgorithmCatalogEntry {
  provenance: AlgorithmProvenance[];
  body: string;
}

export type AlgorithmFrontmatter = Omit<AlgorithmEntry, "body" | "grouping">;

export interface CatalogFilters {
  query: string;
  category: string;
  topic: CatalogPrimaryTopic | "";
  structure: string;
  technique: string;
  difficulty: Difficulty | "";
  status: "all" | "bookmarked" | "completed";
}