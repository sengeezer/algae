import type { AlgorithmEntry } from "@/types/algorithm";

export const algorithms: AlgorithmEntry[] = [
  {
    slug: "binary-search",
    title: "Binary Search",
    category: "Searching",
    summary:
      "Halve a sorted search space until the target either surfaces or the interval collapses.",
    description:
      "Binary search is the default interview move whenever the input is sorted or you can transform the question into a monotonic yes-or-no decision.",
    dataStructures: ["Array"],
    techniques: ["Binary Search", "Divide and Conquer"],
    difficulty: "Easy",
    interviewFrequency: "Very High",
    aliases: ["lower bound", "upper bound", "sorted lookup"],
    useCases: [
      "Finding a value in a sorted array",
      "Searching an answer range for the first feasible value",
      "Shipping capacity or allocation threshold problems",
    ],
    complexity: {
      time: "O(log n)",
      space: "O(1)",
      notes: "The real interview risk is incorrect boundary movement, not the asymptotic cost.",
    },
    interviewSignals: [
      "The prompt mentions sorted order, monotonic rules, or minimum feasible values.",
      "Interviewers often pivot from value lookup to first true or last true variants.",
    ],
    followUps: [
      "Return the insertion point instead of a boolean.",
      "Adapt the search to a rotated sorted array.",
    ],
    pitfalls: [
      "Loop conditions that skip the last candidate.",
      "Returning mid immediately when the task asks for a boundary position.",
    ],
    workedExamples: [
      {
        title: "Lookup in a sorted array",
        input: "nums = [1, 3, 5, 7, 11], target = 7",
        output: "3",
        explanation:
          "Check the middle value 5 first, then discard the left half because the target is larger.",
      },
      {
        title: "First feasible answer",
        input: "minimum capacity that ships packages within D days",
        output: "search the capacity range, not the package list",
        explanation:
          "A feasible capacity stays feasible as the capacity increases, which creates the monotonic condition binary search needs.",
      },
    ],
    codeVariants: [
      {
        label: "Iterative value lookup",
        language: "JavaScript",
        code: String.raw`function binarySearch(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);

    if (nums[mid] === target) {
      return mid;
    }

    if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}`,
      },
      {
        label: "Boundary search template",
        language: "TypeScript",
        code: String.raw`export function firstTrue(low: number, high: number, check: (value: number) => boolean): number {
  let left = low;
  let right = high;

  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);

    if (check(mid)) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }

  return left;
}`,
      },
    ],
    relatedSlugs: ["merge-sort", "topological-sort"],
  },
  {
    slug: "merge-sort",
    title: "Merge Sort",
    category: "Sorting",
    summary:
      "Recursively split the array, sort the halves, and merge them back in linear time.",
    description:
      "Merge sort is a stable divide-and-conquer sort that appears in interviews when you need sorted output and predictable O(n log n) behavior.",
    dataStructures: ["Array"],
    techniques: ["Divide and Conquer", "Sorting"],
    difficulty: "Medium",
    interviewFrequency: "High",
    aliases: ["stable sort", "merge halves"],
    useCases: [
      "Sorting linked data with stable ordering",
      "Counting inversions while sorting",
      "Preparing for interval merging or sweep-line tasks",
    ],
    complexity: {
      time: "O(n log n)",
      space: "O(n)",
      notes: "The merge step is linear, but interviewers often ask whether the extra array can be reused.",
    },
    interviewSignals: [
      "The problem needs stable ordering or an inversion count.",
      "You need to reason about two sorted halves before combining them.",
    ],
    followUps: [
      "Count reverse pairs during the merge.",
      "Explain why quick sort often wins in-place but merge sort keeps stability.",
    ],
    pitfalls: [
      "Forgetting to copy the remainder of one half after the main merge loop.",
      "Allocating new arrays in every merge when a shared buffer would do.",
    ],
    workedExamples: [
      {
        title: "Classic unsorted input",
        input: "[8, 3, 1, 7, 0, 10, 2]",
        output: "[0, 1, 2, 3, 7, 8, 10]",
        explanation:
          "Split until single items remain, then merge neighbors while always taking the smaller front element.",
      },
      {
        title: "Interview extension",
        input: "count how many pairs i < j have nums[i] > nums[j]",
        output: "merge sort gives you the inversion count during merge",
        explanation:
          "Whenever the right half wins before the left half is exhausted, every remaining left item forms an inversion.",
      },
    ],
    codeVariants: [
      {
        label: "Recursive merge sort",
        language: "JavaScript",
        code: String.raw`function mergeSort(nums) {
  if (nums.length <= 1) {
    return nums;
  }

  const middle = Math.floor(nums.length / 2);
  const left = mergeSort(nums.slice(0, middle));
  const right = mergeSort(nums.slice(middle));
  const merged = [];

  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] <= right[rightIndex]) {
      merged.push(left[leftIndex]);
      leftIndex += 1;
    } else {
      merged.push(right[rightIndex]);
      rightIndex += 1;
    }
  }

  return merged.concat(left.slice(leftIndex), right.slice(rightIndex));
}`,
      },
      {
        label: "Typed merge helper",
        language: "TypeScript",
        code: String.raw`export function mergeSort(values: number[]): number[] {
  if (values.length <= 1) {
    return values;
  }

  const midpoint = Math.floor(values.length / 2);
  const left = mergeSort(values.slice(0, midpoint));
  const right = mergeSort(values.slice(midpoint));
  const merged: number[] = [];

  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    merged.push(left[i] <= right[j] ? left[i++] : right[j++]);
  }

  return merged.concat(left.slice(i), right.slice(j));
}`,
      },
    ],
    relatedSlugs: ["binary-search", "prefix-sum"],
  },
  {
    slug: "sliding-window",
    title: "Sliding Window",
    category: "Array Patterns",
    summary:
      "Expand and contract a contiguous range while preserving an invariant about what is inside the window.",
    description:
      "Sliding window is the go-to pattern for substring, subarray, and stream problems where the answer lives inside a contiguous segment.",
    dataStructures: ["Array", "String", "Hash Map"],
    techniques: ["Sliding Window", "Two Pointers"],
    difficulty: "Medium",
    interviewFrequency: "Very High",
    aliases: ["variable window", "contiguous range"],
    useCases: [
      "Longest substring without repeats",
      "Minimum window substring",
      "Rate limiting or rolling statistics",
    ],
    complexity: {
      time: "O(n)",
      space: "O(k)",
      notes: "Each pointer usually moves at most n steps, which is why the pattern stays linear.",
    },
    interviewSignals: [
      "The prompt says subarray, substring, contiguous, or at most k distinct items.",
      "You can describe the valid range using a small state object or counter map.",
    ],
    followUps: [
      "Convert a fixed-size window to a variable-size one.",
      "Track counts with a Map when duplicates matter.",
    ],
    pitfalls: [
      "Shrinking too late and allowing invalid state to leak into the answer.",
      "Recomputing state from scratch instead of updating incrementally.",
    ],
    workedExamples: [
      {
        title: "Longest unique substring",
        input: '"abcabcbb"',
        output: "3",
        explanation:
          "Grow the window while characters stay unique, then move the left pointer until the duplicate is removed.",
      },
      {
        title: "Minimum qualifying segment",
        input: "find the shortest subarray with sum at least target",
        output: "shrink as soon as the current window already satisfies the goal",
        explanation:
          "The interview signal is the need to optimize a contiguous slice under a monotonic condition.",
      },
    ],
    codeVariants: [
      {
        label: "Unique-character window",
        language: "JavaScript",
        code: String.raw`function lengthOfLongestSubstring(text) {
  const lastSeen = new Map();
  let left = 0;
  let best = 0;

  for (let right = 0; right < text.length; right += 1) {
    const char = text[right];

    if (lastSeen.has(char) && lastSeen.get(char) >= left) {
      left = lastSeen.get(char) + 1;
    }

    lastSeen.set(char, right);
    best = Math.max(best, right - left + 1);
  }

  return best;
}`,
      },
      {
        label: "Fixed-size sum window",
        language: "TypeScript",
        code: String.raw`export function maxWindowSum(values: number[], size: number): number {
  if (size > values.length) {
    return Number.NEGATIVE_INFINITY;
  }

  let windowSum = 0;

  for (let index = 0; index < size; index += 1) {
    windowSum += values[index];
  }

  let best = windowSum;

  for (let right = size; right < values.length; right += 1) {
    windowSum += values[right] - values[right - size];
    best = Math.max(best, windowSum);
  }

  return best;
}`,
      },
    ],
    relatedSlugs: ["two-pointers", "prefix-sum"],
  },
  {
    slug: "two-pointers",
    title: "Two Pointers",
    category: "Array Patterns",
    summary:
      "Move two indices through ordered or bounded data to avoid nested loops.",
    description:
      "Two pointers is a family of patterns for sorted arrays, palindrome checks, partitioning, and interval-style scans where one pointer alone is not enough context.",
    dataStructures: ["Array", "String", "Linked List"],
    techniques: ["Two Pointers"],
    difficulty: "Easy",
    interviewFrequency: "Very High",
    aliases: ["fast and slow", "left and right"],
    useCases: [
      "Pair sum in a sorted array",
      "Checking palindromes in place",
      "Cycle detection with fast and slow pointers",
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      notes: "Interviewers usually care more about the invariant behind pointer movement than the syntax.",
    },
    interviewSignals: [
      "The data is sorted, mirrored, or bounded on both ends.",
      "A brute-force solution would compare every pair or rescan the same range.",
    ],
    followUps: [
      "Convert a sorted-array pair search into a three-sum outer loop.",
      "Use fast and slow pointers to locate a linked-list midpoint.",
    ],
    pitfalls: [
      "Moving both pointers after a mismatch without preserving the invariant.",
      "Using this pattern on unsorted data when a hash map is the correct tool.",
    ],
    workedExamples: [
      {
        title: "Sorted pair sum",
        input: "nums = [1, 2, 4, 6, 10], target = 8",
        output: "[2, 6]",
        explanation:
          "Start at both ends. If the sum is too small, move left forward; if it is too large, move right backward.",
      },
      {
        title: "Palindrome check",
        input: '"level"',
        output: "true",
        explanation:
          "Move inward while symmetric characters continue to match.",
      },
    ],
    codeVariants: [
      {
        label: "Pair sum on sorted input",
        language: "JavaScript",
        code: String.raw`function pairSumSorted(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left < right) {
    const sum = nums[left] + nums[right];

    if (sum === target) {
      return [nums[left], nums[right]];
    }

    if (sum < target) {
      left += 1;
    } else {
      right -= 1;
    }
  }

  return null;
}`,
      },
      {
        label: "Typed palindrome scan",
        language: "TypeScript",
        code: String.raw`export function isPalindrome(text: string): boolean {
  let left = 0;
  let right = text.length - 1;

  while (left < right) {
    if (text[left] !== text[right]) {
      return false;
    }

    left += 1;
    right -= 1;
  }

  return true;
}`,
      },
    ],
    relatedSlugs: ["sliding-window", "binary-search"],
  },
  {
    slug: "prefix-sum",
    title: "Prefix Sum",
    category: "Array Patterns",
    summary:
      "Precompute cumulative totals so any range sum becomes a constant-time subtraction.",
    description:
      "Prefix sums surface in interviews whenever repeated range queries or balance checks would otherwise force the same work to be repeated.",
    dataStructures: ["Array", "Matrix", "Hash Map"],
    techniques: ["Prefix Sum", "Precomputation"],
    difficulty: "Easy",
    interviewFrequency: "High",
    aliases: ["cumulative sum", "running total"],
    useCases: [
      "Fast subarray sums",
      "2D matrix region queries",
      "Checking whether a subarray sums to k with a hash map",
    ],
    complexity: {
      time: "O(n) preprocess, O(1) range query",
      space: "O(n)",
      notes: "Prefix sums are often combined with a map to count how many previous states create the desired gap.",
    },
    interviewSignals: [
      "Many range questions target the same array or matrix.",
      "You need to compare a current cumulative state against earlier ones.",
    ],
    followUps: [
      "Extend to 2D by storing row or matrix prefixes.",
      "Count how many subarrays sum to a target instead of returning just one.",
    ],
    pitfalls: [
      "Off-by-one errors when building the extra leading zero slot.",
      "Forgetting that negative numbers break standard sliding-window assumptions but not prefix sums.",
    ],
    workedExamples: [
      {
        title: "Range sum",
        input: "nums = [2, 4, 1, 7], query = [1, 3]",
        output: "12",
        explanation:
          "Store [0, 2, 6, 7, 14] and subtract prefix[1] from prefix[4].",
      },
      {
        title: "Matrix region",
        input: "sum of a rectangular section in a grid",
        output: "use a 2D prefix sum with inclusion-exclusion",
        explanation:
          "This is the standard way to answer repeated matrix-area questions in constant time.",
      },
    ],
    codeVariants: [
      {
        label: "One-dimensional prefix sums",
        language: "JavaScript",
        code: String.raw`function buildPrefixSums(nums) {
  const prefix = new Array(nums.length + 1).fill(0);

  for (let index = 0; index < nums.length; index += 1) {
    prefix[index + 1] = prefix[index] + nums[index];
  }

  return prefix;
}

function rangeSum(prefix, left, right) {
  return prefix[right + 1] - prefix[left];
}`,
      },
      {
        label: "Subarray count with a target sum",
        language: "TypeScript",
        code: String.raw`export function countSubarraysWithSum(values: number[], target: number): number {
  const seen = new Map<number, number>([[0, 1]]);
  let prefix = 0;
  let count = 0;

  for (const value of values) {
    prefix += value;
    count += seen.get(prefix - target) ?? 0;
    seen.set(prefix, (seen.get(prefix) ?? 0) + 1);
  }

  return count;
}`,
      },
    ],
    relatedSlugs: ["sliding-window", "merge-sort"],
  },
  {
    slug: "breadth-first-search",
    title: "Breadth-First Search",
    category: "Graphs",
    summary:
      "Explore level by level so the first time you reach a node is also the shortest unweighted distance.",
    description:
      "BFS is essential for shortest-path problems on unweighted graphs, level-order tree traversals, and grid wavefront searches.",
    dataStructures: ["Graph", "Queue", "Tree", "Matrix"],
    techniques: ["Breadth-First Search", "Graph Traversal"],
    difficulty: "Medium",
    interviewFrequency: "Very High",
    aliases: ["level-order traversal", "wavefront search"],
    useCases: [
      "Shortest path in an unweighted graph",
      "Rotting oranges or flood spread in a matrix",
      "Tree level-order traversal",
    ],
    complexity: {
      time: "O(V + E)",
      space: "O(V)",
      notes: "On grid problems, V and E are usually expressed in terms of rows and columns instead of graph notation.",
    },
    interviewSignals: [
      "The prompt asks for the fewest moves on an unweighted state space.",
      "The solution should expand in rings or levels.",
    ],
    followUps: [
      "Store parents so you can reconstruct the actual path.",
      "Run a multi-source BFS from every starting condition at once.",
    ],
    pitfalls: [
      "Marking nodes as visited too late and enqueuing duplicates.",
      "Using BFS on weighted edges when Dijkstra is required.",
    ],
    workedExamples: [
      {
        title: "Level order on a tree",
        input: "root with children on multiple depths",
        output: "nodes grouped by depth",
        explanation:
          "Each queue batch represents a complete layer before deeper nodes are processed.",
      },
      {
        title: "Shortest route in a grid",
        input: "matrix with walls and open cells",
        output: "minimum number of steps",
        explanation:
          "The first time the target cell is popped from the queue, the path length is minimal.",
      },
    ],
    codeVariants: [
      {
        label: "Queue-based graph traversal",
        language: "JavaScript",
        code: String.raw`function bfs(graph, start) {
  const queue = [start];
  const visited = new Set([start]);
  const order = [];

  while (queue.length > 0) {
    const node = queue.shift();
    order.push(node);

    for (const neighbor of graph.get(node) ?? []) {
      if (visited.has(neighbor)) {
        continue;
      }

      visited.add(neighbor);
      queue.push(neighbor);
    }
  }

  return order;
}`,
      },
      {
        label: "Grid shortest path",
        language: "TypeScript",
        code: String.raw`type Point = [row: number, column: number];

export function shortestPath(grid: number[][], start: Point, target: Point): number {
  const queue: Array<[Point, number]> = [[start, 0]];
  const visited = new Set([start.join(":")]);
  const directions: Point[] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  while (queue.length > 0) {
    const [[row, column], steps] = queue.shift()!;

    if (row === target[0] && column === target[1]) {
      return steps;
    }

    for (const [dr, dc] of directions) {
      const nextRow = row + dr;
      const nextColumn = column + dc;
      const key = \`\${nextRow}:\${nextColumn}\`;

      if (
        nextRow < 0 ||
        nextRow >= grid.length ||
        nextColumn < 0 ||
        nextColumn >= grid[0].length ||
        grid[nextRow][nextColumn] === 1 ||
        visited.has(key)
      ) {
        continue;
      }

      visited.add(key);
      queue.push([[nextRow, nextColumn], steps + 1]);
    }
  }

  return -1;
}`,
      },
    ],
    relatedSlugs: ["depth-first-search", "dijkstra"],
  },
  {
    slug: "depth-first-search",
    title: "Depth-First Search",
    category: "Graphs",
    summary:
      "Dive down one branch before backtracking, which makes DFS ideal for exhaustive exploration and structural checks.",
    description:
      "DFS appears in traversal, cycle detection, connected components, backtracking, and recursive tree questions where you need context from the current path.",
    dataStructures: ["Graph", "Stack", "Tree", "Matrix"],
    techniques: ["Depth-First Search", "Graph Traversal", "Recursion"],
    difficulty: "Medium",
    interviewFrequency: "Very High",
    aliases: ["recursive traversal", "backtracking traversal"],
    useCases: [
      "Counting islands in a matrix",
      "Cycle detection in directed graphs",
      "Subtree property checks",
    ],
    complexity: {
      time: "O(V + E)",
      space: "O(V)",
      notes: "Recursive DFS also consumes call-stack space, which interviewers often ask you to acknowledge.",
    },
    interviewSignals: [
      "You need to explore every branch or maintain path-specific state.",
      "The prompt references connected components, recursion, or backtracking.",
    ],
    followUps: [
      "Convert the recursion to an explicit stack.",
      "Track discovery states to detect directed cycles.",
    ],
    pitfalls: [
      "Forgetting to mark a node before recursing and revisiting it.",
      "Mixing global visited state with path-local state in backtracking problems.",
    ],
    workedExamples: [
      {
        title: "Connected cells in a matrix",
        input: "grid with land and water",
        output: "count of islands",
        explanation:
          "When you discover land, mark the whole component before advancing the outer loop.",
      },
      {
        title: "Directed cycle check",
        input: "course prerequisites graph",
        output: "false when recursion enters an already-active node",
        explanation:
          "This is the DFS version of topological-sort feasibility.",
      },
    ],
    codeVariants: [
      {
        label: "Recursive traversal",
        language: "JavaScript",
        code: String.raw`function dfs(graph, start, visited = new Set(), order = []) {
  if (visited.has(start)) {
    return order;
  }

  visited.add(start);
  order.push(start);

  for (const neighbor of graph.get(start) ?? []) {
    dfs(graph, neighbor, visited, order);
  }

  return order;
}`,
      },
      {
        label: "Explicit stack traversal",
        language: "TypeScript",
        code: String.raw`export function dfsIterative(graph: Map<string, string[]>, start: string): string[] {
  const stack = [start];
  const visited = new Set<string>();
  const order: string[] = [];

  while (stack.length > 0) {
    const node = stack.pop()!;

    if (visited.has(node)) {
      continue;
    }

    visited.add(node);
    order.push(node);

    const neighbors = graph.get(node) ?? [];

    for (let index = neighbors.length - 1; index >= 0; index -= 1) {
      if (!visited.has(neighbors[index])) {
        stack.push(neighbors[index]);
      }
    }
  }

  return order;
}`,
      },
    ],
    relatedSlugs: ["breadth-first-search", "topological-sort"],
  },
  {
    slug: "dijkstra",
    title: "Dijkstra's Algorithm",
    category: "Graphs",
    summary:
      "Use a priority queue to keep extending the cheapest known path in a graph with non-negative weights.",
    description:
      "Dijkstra is the interview answer when edges have costs, BFS is no longer correct, and every weight is non-negative.",
    dataStructures: ["Graph", "Heap", "Priority Queue"],
    techniques: ["Shortest Path", "Greedy", "Priority Queue"],
    difficulty: "Hard",
    interviewFrequency: "High",
    aliases: ["weighted shortest path"],
    useCases: [
      "Minimum travel time between cities",
      "Network delay problems",
      "Routing with road or latency weights",
    ],
    complexity: {
      time: "O((V + E) log V)",
      space: "O(V)",
      notes: "The interview shortcut is to allow duplicate heap entries and ignore stale ones when they pop.",
    },
    interviewSignals: [
      "The graph edges carry non-negative costs.",
      "The shortest route is asked for, but BFS would ignore weights.",
    ],
    followUps: [
      "Explain why negative weights require Bellman-Ford instead.",
      "Return the path itself by storing parent pointers.",
    ],
    pitfalls: [
      "Using Dijkstra on graphs with negative edges.",
      "Updating the queue without checking for stale distances on pop.",
    ],
    workedExamples: [
      {
        title: "Weighted network",
        input: "nodes with edge weights representing time",
        output: "shortest travel time from the source",
        explanation:
          "The next node processed is always the cheapest unsettled node in the frontier.",
      },
      {
        title: "Interview contrast",
        input: "same graph but every edge cost is 1",
        output: "BFS is enough",
        explanation:
          "Interviewers often ask why the heavier algorithm is unnecessary in the unweighted case.",
      },
    ],
    codeVariants: [
      {
        label: "Priority queue with sorted inserts",
        language: "JavaScript",
        code: String.raw`function dijkstra(graph, start) {
  const distances = new Map([[start, 0]]);
  const heap = [[0, start]];

  while (heap.length > 0) {
    heap.sort((a, b) => a[0] - b[0]);
    const [distance, node] = heap.shift();

    if (distance > (distances.get(node) ?? Infinity)) {
      continue;
    }

    for (const [neighbor, weight] of graph.get(node) ?? []) {
      const nextDistance = distance + weight;

      if (nextDistance < (distances.get(neighbor) ?? Infinity)) {
        distances.set(neighbor, nextDistance);
        heap.push([nextDistance, neighbor]);
      }
    }
  }

  return distances;
}`,
      },
      {
        label: "Typed shortest distances",
        language: "TypeScript",
        code: String.raw`type Edge = [to: string, weight: number];

export function dijkstra(graph: Map<string, Edge[]>, start: string): Map<string, number> {
  const distances = new Map<string, number>([[start, 0]]);
  const queue: Array<[distance: number, node: string]> = [[0, start]];

  while (queue.length > 0) {
    queue.sort((a, b) => a[0] - b[0]);
    const [distance, node] = queue.shift()!;

    if (distance > (distances.get(node) ?? Number.POSITIVE_INFINITY)) {
      continue;
    }

    for (const [neighbor, weight] of graph.get(node) ?? []) {
      const candidate = distance + weight;

      if (candidate < (distances.get(neighbor) ?? Number.POSITIVE_INFINITY)) {
        distances.set(neighbor, candidate);
        queue.push([candidate, neighbor]);
      }
    }
  }

  return distances;
}`,
      },
    ],
    relatedSlugs: ["breadth-first-search", "topological-sort"],
  },
  {
    slug: "topological-sort",
    title: "Topological Sort",
    category: "Graphs",
    summary:
      "Order a directed acyclic graph so every prerequisite appears before what depends on it.",
    description:
      "Topological sort is the standard answer for dependency ordering, course schedules, and build pipelines with prerequisite constraints.",
    dataStructures: ["Graph", "Queue"],
    techniques: ["Topological Sort", "Graph Traversal"],
    difficulty: "Medium",
    interviewFrequency: "High",
    aliases: ["dependency ordering", "kahn's algorithm"],
    useCases: [
      "Course scheduling",
      "Build or deployment dependencies",
      "Ordering tasks with prerequisites",
    ],
    complexity: {
      time: "O(V + E)",
      space: "O(V + E)",
      notes: "The important interview detail is that a valid ordering exists only when the graph has no directed cycle.",
    },
    interviewSignals: [
      "The prompt says one item must happen before another.",
      "You need to decide whether all tasks can be completed in some valid order.",
    ],
    followUps: [
      "Detect whether the graph contains a cycle.",
      "Produce all valid orderings for a small dependency graph.",
    ],
    pitfalls: [
      "Forgetting to seed the queue with every zero-indegree node.",
      "Returning an ordering without checking whether all nodes were processed.",
    ],
    workedExamples: [
      {
        title: "Course prerequisites",
        input: "A -> C, B -> C, C -> D",
        output: "A, B, C, D or B, A, C, D",
        explanation:
          "Any zero-indegree course can be taken next, which is why multiple valid orders may exist.",
      },
      {
        title: "Cycle detection",
        input: "A -> B -> C -> A",
        output: "no valid topological order",
        explanation:
          "The queue empties before every node is processed, which exposes the cycle.",
      },
    ],
    codeVariants: [
      {
        label: "Kahn's algorithm",
        language: "JavaScript",
        code: String.raw`function topologicalSort(graph) {
  const indegree = new Map();

  for (const [node, neighbors] of graph.entries()) {
    indegree.set(node, indegree.get(node) ?? 0);

    for (const neighbor of neighbors) {
      indegree.set(neighbor, (indegree.get(neighbor) ?? 0) + 1);
    }
  }

  const queue = [];

  for (const [node, degree] of indegree.entries()) {
    if (degree === 0) {
      queue.push(node);
    }
  }

  const order = [];

  while (queue.length > 0) {
    const node = queue.shift();
    order.push(node);

    for (const neighbor of graph.get(node) ?? []) {
      indegree.set(neighbor, indegree.get(neighbor) - 1);

      if (indegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  return order.length === indegree.size ? order : [];
}`,
      },
      {
        label: "Course-feasibility helper",
        language: "TypeScript",
        code: String.raw`export function canFinishCourses(totalCourses: number, prerequisites: Array<[number, number]>): boolean {
  const adjacency = Array.from({ length: totalCourses }, () => [] as number[]);
  const indegree = new Array<number>(totalCourses).fill(0);

  for (const [course, prerequisite] of prerequisites) {
    adjacency[prerequisite].push(course);
    indegree[course] += 1;
  }

  const queue: number[] = [];

  for (let course = 0; course < totalCourses; course += 1) {
    if (indegree[course] === 0) {
      queue.push(course);
    }
  }

  let taken = 0;

  while (queue.length > 0) {
    const course = queue.shift()!;
    taken += 1;

    for (const nextCourse of adjacency[course]) {
      indegree[nextCourse] -= 1;

      if (indegree[nextCourse] === 0) {
        queue.push(nextCourse);
      }
    }
  }

  return taken === totalCourses;
}`,
      },
    ],
    relatedSlugs: ["depth-first-search", "binary-search"],
  },
  {
    slug: "knapsack-dp",
    title: "0/1 Knapsack",
    category: "Dynamic Programming",
    summary:
      "Choose the best subset of items without exceeding capacity by reusing overlapping subproblems.",
    description:
      "Knapsack is a canonical dynamic-programming pattern for maximize-under-constraint questions where each item can be taken at most once.",
    dataStructures: ["Array", "Table"],
    techniques: ["Dynamic Programming"],
    difficulty: "Medium",
    interviewFrequency: "High",
    aliases: ["take-or-skip dp"],
    useCases: [
      "Resource allocation under capacity limits",
      "Budgeted selection problems",
      "Subset optimization with value and weight",
    ],
    complexity: {
      time: "O(n * capacity)",
      space: "O(capacity)",
      notes: "Interviewers often reward the one-dimensional optimization that iterates capacity backward.",
    },
    interviewSignals: [
      "Each choice is either taken or skipped.",
      "The score is optimized under a maximum capacity, budget, or time limit.",
    ],
    followUps: [
      "Explain why the complete knapsack iterates capacity forward instead.",
      "Recover which items were selected, not just the best value.",
    ],
    pitfalls: [
      "Iterating capacity forward and accidentally reusing an item multiple times.",
      "Overcomplicating the state when only the previous row matters.",
    ],
    workedExamples: [
      {
        title: "Budget allocation",
        input: "weights = [2, 3, 4], values = [4, 5, 10], capacity = 6",
        output: "14",
        explanation:
          "The optimal set is weight 2 plus weight 4, not the locally best single value.",
      },
      {
        title: "Interview framing",
        input: "choose projects under a staffing budget",
        output: "same take-or-skip state transition",
        explanation:
          "The surface story changes, but the dynamic-programming structure stays the same.",
      },
    ],
    codeVariants: [
      {
        label: "Space-optimized knapsack",
        language: "JavaScript",
        code: String.raw`function knapsack(weights, values, capacity) {
  const dp = new Array(capacity + 1).fill(0);

  for (let item = 0; item < weights.length; item += 1) {
    for (let space = capacity; space >= weights[item]; space -= 1) {
      dp[space] = Math.max(dp[space], dp[space - weights[item]] + values[item]);
    }
  }

  return dp[capacity];
}`,
      },
      {
        label: "Typed 0/1 knapsack",
        language: "TypeScript",
        code: String.raw`export function knapsack(weights: number[], values: number[], capacity: number): number {
  const dp = new Array<number>(capacity + 1).fill(0);

  for (let item = 0; item < weights.length; item += 1) {
    for (let space = capacity; space >= weights[item]; space -= 1) {
      dp[space] = Math.max(dp[space], dp[space - weights[item]] + values[item]);
    }
  }

  return dp[capacity];
}`,
      },
    ],
    relatedSlugs: ["prefix-sum", "minimax"],
  },
  {
    slug: "trie",
    title: "Trie",
    category: "Strings",
    summary:
      "Store characters by prefix so starts-with and autocomplete queries avoid rescanning whole words.",
    description:
      "Tries appear in interviews for autocomplete, dictionary lookup, prefix validation, and wildcard word-search tasks.",
    dataStructures: ["Tree", "String", "Hash Map"],
    techniques: ["Trie", "Prefix Matching"],
    difficulty: "Medium",
    interviewFrequency: "Medium",
    aliases: ["prefix tree"],
    useCases: [
      "Autocomplete suggestions",
      "Dictionary or spell-check prefixes",
      "Word search on a board with repeated prefix pruning",
    ],
    complexity: {
      time: "O(k) per insert or query",
      space: "O(total characters stored)",
      notes: "The tradeoff is memory for faster prefix operations, which interviewers often ask you to justify.",
    },
    interviewSignals: [
      "The question repeatedly asks whether many strings share a prefix.",
      "Brute force would compare each query string against a whole dictionary.",
    ],
    followUps: [
      "Track counts to support prefix frequency queries.",
      "Combine the trie with DFS for board word search problems.",
    ],
    pitfalls: [
      "Treating end-of-word markers as optional and losing exact-word checks.",
      "Using a trie when the data set is tiny and a hash set would be simpler.",
    ],
    workedExamples: [
      {
        title: "Autocomplete",
        input: 'insert ["cat", "car", "dog"] and query prefix "ca"',
        output: 'prefix exists and can branch to "cat" and "car"',
        explanation:
          "The shared prefix is stored once, then the words split only when their characters diverge.",
      },
      {
        title: "Board pruning",
        input: "search a letter board for many words",
        output: "skip DFS branches that no longer match any prefix",
        explanation:
          "This is the interview reason tries often pair with DFS.",
      },
    ],
    codeVariants: [
      {
        label: "Simple trie node",
        language: "JavaScript",
        code: String.raw`class TrieNode {
  constructor() {
    this.children = new Map();
    this.isWord = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;

    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }

      node = node.children.get(char);
    }

    node.isWord = true;
  }
}`,
      },
      {
        label: "Prefix lookup",
        language: "TypeScript",
        code: String.raw`class TrieNode {
  children = new Map<string, TrieNode>();
  isWord = false;
}

export class Trie {
  private root = new TrieNode();

  insert(word: string): void {
    let node = this.root;

    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }

      node = node.children.get(char)!;
    }

    node.isWord = true;
  }

  startsWith(prefix: string): boolean {
    let node = this.root;

    for (const char of prefix) {
      const next = node.children.get(char);

      if (!next) {
        return false;
      }

      node = next;
    }

    return true;
  }
}`,
      },
    ],
    relatedSlugs: ["depth-first-search", "sliding-window"],
  },
  {
    slug: "minimax",
    title: "Minimax",
    category: "Game Search",
    summary:
      "Model alternating turns by choosing the move that maximizes your outcome while assuming the opponent minimizes it.",
    description:
      "Minimax appears in interviews when a game or rules engine needs optimal play over a small search space, especially on board states such as tic-tac-toe.",
    dataStructures: ["Tree", "Matrix"],
    techniques: ["Backtracking", "Game Theory", "Minimax"],
    difficulty: "Hard",
    interviewFrequency: "Medium",
    aliases: ["optimal game search", "tic tac toe strategy"],
    useCases: [
      "Evaluating rules of tic tac toe",
      "Turn-based board games with a small branching factor",
      "Building a simple AI opponent for a deterministic game",
    ],
    complexity: {
      time: "O(b^d)",
      space: "O(d)",
      notes: "Interviewers usually accept a small-state-space version and may ask when alpha-beta pruning becomes useful.",
    },
    interviewSignals: [
      "Players alternate turns and both choose optimally.",
      "The prompt mentions board rules, tic tac toe, or evaluating future responses.",
    ],
    followUps: [
      "Add alpha-beta pruning to skip dominated branches.",
      "Memoize board states when repeated positions are common.",
    ],
    pitfalls: [
      "Scoring terminal states inconsistently for maximizing versus minimizing turns.",
      "Searching too deeply when the state space already proves a forced win or draw.",
    ],
    workedExamples: [
      {
        title: "Tic tac toe move choice",
        input: "3x3 board with one move left to force a draw",
        output: "select the move with the best worst-case score",
        explanation:
          "Minimax assumes the opponent responds with the strongest available move, not a random one.",
      },
      {
        title: "Rule-driven board search",
        input: "evaluate rules of tic tac toe from a mid-game board",
        output: "search the game tree and score terminal wins, losses, and draws",
        explanation:
          "This is the natural-language search phrase the catalog should surface.",
      },
    ],
    codeVariants: [
      {
        label: "Core minimax recursion",
        language: "JavaScript",
        code: String.raw`function minimax(board, isMaximizingPlayer) {
  const score = evaluateBoard(board);

  if (score !== null) {
    return score;
  }

  const moves = getAvailableMoves(board);

  if (isMaximizingPlayer) {
    let best = -Infinity;

    for (const move of moves) {
      const nextBoard = applyMove(board, move, "X");
      best = Math.max(best, minimax(nextBoard, false));
    }

    return best;
  }

  let best = Infinity;

  for (const move of moves) {
    const nextBoard = applyMove(board, move, "O");
    best = Math.min(best, minimax(nextBoard, true));
  }

  return best;
}`,
      },
      {
        label: "Typed score wrapper",
        language: "TypeScript",
        code: String.raw`type Cell = "X" | "O" | null;
type Board = Cell[];

export function chooseMove(board: Board, availableMoves: number[]): number | null {
  let bestMove: number | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const move of availableMoves) {
    const nextBoard = [...board];
    nextBoard[move] = "X";
    const score = minimax(nextBoard, false);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function minimax(board: Board, maximizing: boolean): number {
  const terminalScore = evaluateBoard(board);

  if (terminalScore !== null) {
    return terminalScore;
  }

  const nextPlayer: Cell = maximizing ? "X" : "O";
  const scores: number[] = [];

  for (let index = 0; index < board.length; index += 1) {
    if (board[index] !== null) {
      continue;
    }

    const nextBoard = [...board];
    nextBoard[index] = nextPlayer;
    scores.push(minimax(nextBoard, !maximizing));
  }

  return maximizing ? Math.max(...scores) : Math.min(...scores);
}

function evaluateBoard(board: Board): number | null {
  return board.every((cell) => cell !== null) ? 0 : null;
}`,
      },
    ],
    relatedSlugs: ["depth-first-search", "knapsack-dp"],
  },
];