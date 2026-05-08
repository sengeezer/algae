import type {
  AlgorithmCatalogEntry,
  AlgorithmEntry,
  AlgorithmGrouping,
  CatalogPrimaryTopic,
  Difficulty,
} from "@/types/algorithm";

type TaxonomyInput = Pick<AlgorithmEntry, "category" | "dataStructures" | "difficulty" | "techniques">;

export const catalogTopicOrder: CatalogPrimaryTopic[] = [
  "Arrays & Matrices",
  "Strings & Text",
  "Linked Structures",
  "Trees & Heaps",
  "Graphs",
  "Searching & Sorting",
  "Dynamic Programming",
  "Greedy",
  "Backtracking & Recursion",
  "Advanced Data Structures",
  "Mathematics",
  "Geometry",
  "Systems & Utilities",
];

const primaryTopicByCategory: Record<string, CatalogPrimaryTopic> = {
  Algebra: "Mathematics",
  Arrays: "Arrays & Matrices",
  "Array Patterns": "Arrays & Matrices",
  "Array Processing": "Arrays & Matrices",
  Backtracking: "Backtracking & Recursion",
  "Binary Search": "Searching & Sorting",
  "Bit Manipulation": "Mathematics",
  Ciphers: "Strings & Text",
  Combinatorics: "Mathematics",
  "Combinatorial Search": "Backtracking & Recursion",
  Compression: "Strings & Text",
  Conversions: "Systems & Utilities",
  Design: "Systems & Utilities",
  "Divide and Conquer": "Backtracking & Recursion",
  "Dynamic Programming": "Dynamic Programming",
  Factorial: "Mathematics",
  "Fibonacci Numbers": "Mathematics",
  Geometry: "Geometry",
  Graph: "Graphs",
  Graphs: "Graphs",
  "Graph Traversal": "Graphs",
  Greedy: "Greedy",
  Heap: "Trees & Heaps",
  "Linked Lists": "Linked Structures",
  Mathematics: "Mathematics",
  Matrices: "Arrays & Matrices",
  Matrix: "Arrays & Matrices",
  Navigation: "Graphs",
  "Number System": "Mathematics",
  "Number Theory": "Mathematics",
  Permutations: "Backtracking & Recursion",
  "Prime Factorization & Divisors": "Mathematics",
  "Prime Numbers & Primality Tests": "Mathematics",
  "Project Euler": "Mathematics",
  Queues: "Linked Structures",
  "Range Queries": "Advanced Data Structures",
  Recursion: "Backtracking & Recursion",
  Scheduling: "Systems & Utilities",
  Searching: "Searching & Sorting",
  Selection: "Searching & Sorting",
  Sorting: "Searching & Sorting",
  Stacks: "Linked Structures",
  String: "Strings & Text",
  Strings: "Strings & Text",
  "String Processing": "Strings & Text",
  "Timing Functions": "Systems & Utilities",
  Trees: "Trees & Heaps",
};

const techniqueFamilyMatchers: Array<{
  family: string;
  matches: (input: TaxonomyInput) => boolean;
}> = [
  {
    family: "Arrays & Matrices",
    matches: ({ category, dataStructures }) =>
      ["Arrays", "Array Patterns", "Array Processing", "Matrix", "Matrices"].includes(category) ||
      dataStructures.some((value) => ["Array", "Matrix"].includes(value)),
  },
  {
    family: "String Algorithms",
    matches: ({ category, dataStructures, techniques }) =>
      ["String", "Strings", "String Processing", "Ciphers", "Compression"].includes(category) ||
      dataStructures.includes("String") ||
      techniques.some((value) => value.toLowerCase().includes("string")),
  },
  {
    family: "Core Data Structures",
    matches: ({ category, dataStructures }) =>
      ["Linked Lists", "Queues", "Stacks", "Design"].includes(category) ||
      dataStructures.some((value) => ["Linked List", "Queue", "Stack", "Deque"].includes(value)),
  },
  {
    family: "Tree & Heap Algorithms",
    matches: ({ category, dataStructures }) =>
      ["Trees", "Heap"].includes(category) ||
      dataStructures.some((value) => ["Tree", "Binary Tree", "Binary Search Tree", "Heap", "Trie"].includes(value)),
  },
  {
    family: "Graph Algorithms",
    matches: ({ category, dataStructures, techniques }) =>
      ["Graph", "Graphs", "Graph Traversal", "Navigation", "Game Search"].includes(category) ||
      dataStructures.includes("Graph") ||
      techniques.some((value) => {
        const normalized = value.toLowerCase();
        return normalized.includes("graph") || normalized.includes("bfs") || normalized.includes("dfs");
      }),
  },
  {
    family: "Searching & Sorting",
    matches: ({ category, techniques }) =>
      ["Searching", "Sorting", "Binary Search", "Selection"].includes(category) ||
      techniques.some((value) => {
        const normalized = value.toLowerCase();
        return normalized.includes("search") || normalized.includes("sort");
      }),
  },
  {
    family: "Dynamic Programming",
    matches: ({ category, techniques }) =>
      category === "Dynamic Programming" ||
      techniques.some((value) => value.toLowerCase().includes("dynamic programming")),
  },
  {
    family: "Greedy",
    matches: ({ category, techniques }) =>
      category === "Greedy" || techniques.some((value) => value.toLowerCase().includes("greedy")),
  },
  {
    family: "Backtracking & Recursion",
    matches: ({ category, techniques }) =>
      ["Backtracking", "Recursion", "Combinatorial Search", "Permutations", "Divide and Conquer"].includes(category) ||
      techniques.some((value) => {
        const normalized = value.toLowerCase();
        return normalized.includes("backtracking") || normalized.includes("recursion");
      }),
  },
  {
    family: "Advanced Data Structures",
    matches: ({ category, dataStructures }) =>
      category === "Range Queries" ||
      dataStructures.some((value) => ["Segment Tree", "Fenwick Tree", "Binary Indexed Tree"].includes(value)),
  },
  {
    family: "Mathematics",
    matches: ({ category, techniques }) =>
      [
        "Mathematics",
        "Bit Manipulation",
        "Combinatorics",
        "Project Euler",
        "Prime Numbers & Primality Tests",
        "Prime Factorization & Divisors",
        "Modular Arithmetic",
        "Number System",
        "Fibonacci Numbers",
        "Factorial",
        "Algebra",
        "Number Theory",
      ].includes(category) || techniques.some((value) => value.toLowerCase().includes("bit")),
  },
  {
    family: "Geometry",
    matches: ({ category }) => category === "Geometry",
  },
  {
    family: "Systems & Utilities",
    matches: ({ category }) =>
      ["Conversions", "Timing Functions", "Scheduling", "Systems & Utilities"].includes(category),
  },
];

function normalizeDifficultyTopic(difficulty: Difficulty): CatalogPrimaryTopic {
  return difficulty === "Hard" ? "Advanced Data Structures" : "Systems & Utilities";
}

function deriveTechniqueFamilies(input: TaxonomyInput): string[] {
  const families = techniqueFamilyMatchers
    .filter((matcher) => matcher.matches(input))
    .map((matcher) => matcher.family);

  if (families.length > 0) {
    return families;
  }

  return [primaryTopicByCategory[input.category] ?? normalizeDifficultyTopic(input.difficulty)];
}

export function deriveAlgorithmGrouping(input: TaxonomyInput): AlgorithmGrouping {
  const primaryTopic =
    primaryTopicByCategory[input.category] ?? normalizeDifficultyTopic(input.difficulty);

  return {
    primaryTopic,
    techniqueFamilies: deriveTechniqueFamilies(input),
  };
}

export function groupAlgorithmsByPrimaryTopic(algorithms: AlgorithmCatalogEntry[]) {
  return catalogTopicOrder
    .map((primaryTopic) => ({
      primaryTopic,
      algorithms: algorithms.filter((algorithm) => algorithm.grouping.primaryTopic === primaryTopic),
    }))
    .filter((group) => group.algorithms.length > 0);
}