# Algae catalog expansion

## Sources for JavaScript / TypeScript algorithms
- https://github.com/TheAlgorithms/JavaScript
- https://github.com/EbookFoundation/free-programming-books/blob/main/books/free-programming-books-subjects.md#algorithms--data-structures

## Existing overlap to skip

Use `src/content/algorithms/` as the source of truth before adding any candidate from the research sources below. The catalog already covers these source-aligned topics, so they should not be re-added during expansion passes:

- A* Search
- Bellman-Ford
- Binary Search
- Breadth-First Search
- Depth-First Search
- Dijkstra
- Fenwick Tree
- Floyd-Warshall
- KMP String Search
- Kruskal MST
- Longest Increasing Subsequence
- LRU Cache
- Merge Sort
- Quick Sort
- Quickselect
- Rabin-Karp
- Segment Tree
- Sliding Window
- Topological Sort
- Trie
- Union Find

## Batch 1 added

This first expansion slice lifts the catalog from 37 to 45 entries.

- Coin Change
- Edit Distance
- House Robber
- Longest Common Subsequence
- N-Queens
- Number of Islands
- Trapping Rain Water
- Unique Paths

## Batch 2 added

This second expansion slice lifts the catalog from 45 to 50 entries.

- Boyer-Moore
- Connected Components
- Heap Sort
- Longest Palindromic Subsequence
- Prim MST

## Provenance metadata

All expansion entries from batch 1 and batch 2 now carry explicit per-entry provenance metadata:

- One implementation link back to TheAlgorithms/JavaScript
- One study-reference link discovered through the free-programming-books algorithms list
- UI surfacing on the algorithm detail page so source lineage is visible without opening this planning note

## Why this batch

- It fills obvious interview-core gaps from TheAlgorithms/JavaScript without duplicating material already present in Algae.
- It broadens the current catalog across dynamic programming, backtracking, graph traversal, and array-invariant problems instead of overloading a single category.
- It lines up with the broader textbook-style coverage highlighted by the free-programming-books algorithms list, especially standard DP, graph, and search/backtracking topics.

## Supporting study references from the algorithms list

- Algorithm Design
- Algorithmic Thinking
- Algorithms, 4th Edition
- Competitive Programmer's Handbook
- Open Data Structures: An Introduction
- Text Algorithms

## Next candidates from the same sources

- Binary Heap
- Exponential Search
- Flood Fill
- LFU Cache
- Longest Valid Parentheses
- Binary Lifting