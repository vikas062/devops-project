import "dotenv/config";
import { connectDb } from "./config/db.js";
import { CanonicalQuestion } from "./models/CanonicalQuestion.js";
import { User } from "./models/User.js";
import bcrypt from "bcryptjs";

const seedQuestions = [
  {
    canonicalTitle: "Find pair with given sum",
    topic: ["Array", "HashMap"],
    overallMatch: 92,
    platforms: [
      { platform: "LeetCode", name: "Two Sum", link: "https://leetcode.com/problems/two-sum/", score: 95 },
      { platform: "GFG", name: "Count pairs with given sum", link: "https://www.geeksforgeeks.org/count-pairs-with-given-sum/", score: 92 },
      { platform: "Codeforces", name: "Two Sum", link: "https://codeforces.com/problemset/problem/1462/A", score: 88 },
      { platform: "HackerRank", name: "Ice Cream Parlor", link: "https://www.hackerrank.com/challenges/icecream-parlor", score: 85 },
      { platform: "SPOJ", name: "TWOSUM", link: "https://www.spoj.com/problems/TWOSUM/", score: 90 }
    ]
  },
  {
    canonicalTitle: "Reverse a singly linked list",
    topic: ["Linked List"],
    overallMatch: 97,
    platforms: [
      { platform: "LeetCode", name: "Reverse Linked List", link: "https://leetcode.com/problems/reverse-linked-list/", score: 98 },
      { platform: "GFG", name: "Reverse a linked list", link: "https://www.geeksforgeeks.org/reverse-a-linked-list/", score: 97 },
      { platform: "HackerRank", name: "Reverse a linked list", link: "https://www.hackerrank.com/challenges/reverse-a-linked-list", score: 96 },
      { platform: "CodeChef", name: "Reverse the list", link: "https://www.codechef.com/problems/REVERSE", score: 90 },
      { platform: "SPOJ", name: "RLIST", link: "https://www.spoj.com/problems/RLIST/", score: 88 }
    ]
  },
  {
    canonicalTitle: "Balanced parentheses",
    topic: ["Stack"],
    overallMatch: 90,
    platforms: [
      { platform: "LeetCode", name: "Valid Parentheses", link: "https://leetcode.com/problems/valid-parentheses/", score: 94 },
      { platform: "GFG", name: "Parenthesis Checker", link: "https://www.geeksforgeeks.org/check-for-balanced-parentheses-in-an-expression/", score: 92 },
      { platform: "HackerRank", name: "Balanced Brackets", link: "https://www.hackerrank.com/challenges/balanced-brackets", score: 90 },
      { platform: "Codeforces", name: "Regular Bracket Sequence", link: "https://codeforces.com/problemset/problem/5/C", score: 85 },
      { platform: "SPOJ", name: "ANARC09A", link: "https://www.spoj.com/problems/ANARC09A/", score: 85 }
    ]
  },
  {
    canonicalTitle: "Kadane’s Algorithm",
    topic: ["Array", "DP"],
    overallMatch: 95,
    platforms: [
      { platform: "LeetCode", name: "Maximum Subarray", link: "https://leetcode.com/problems/maximum-subarray/", score: 96 },
      { platform: "GFG", name: "Kadane’s Algorithm", link: "https://www.geeksforgeeks.org/kadanes-algorithm/", score: 95 },
      { platform: "Codeforces", name: "Maximum Subarray", link: "https://codeforces.com/problemset/problem/327/A", score: 90 },
      { platform: "CodeChef", name: "Max Subarray Sum", link: "https://www.codechef.com/problems/MAXSUB", score: 88 },
      { platform: "SPOJ", name: "MAXSUM", link: "https://www.spoj.com/problems/MAXSUM/", score: 92 }
    ]
  },
  {
    canonicalTitle: "Binary search in sorted array",
    topic: ["Binary Search"],
    overallMatch: 98,
    platforms: [
      { platform: "LeetCode", name: "Binary Search", link: "https://leetcode.com/problems/binary-search/", score: 99 },
      { platform: "GFG", name: "Binary Search", link: "https://www.geeksforgeeks.org/binary-search/", score: 98 },
      { platform: "Codeforces", name: "Binary Search", link: "https://codeforces.com/problemset/problem/474/B", score: 92 },
      { platform: "HackerRank", name: "Binary Search", link: "https://www.hackerrank.com/challenges/binary-search", score: 90 },
      { platform: "CodeChef", name: "Binary Search", link: "https://www.codechef.com/problems/BINARYSUB", score: 88 }
    ]
  },
  {
    canonicalTitle: "Find majority element",
    topic: ["Array"],
    overallMatch: 93,
    platforms: [
      { platform: "LeetCode", name: "Majority Element", link: "https://leetcode.com/problems/majority-element/", score: 95 },
      { platform: "GFG", name: "Majority Element", link: "https://www.geeksforgeeks.org/majority-element/", score: 93 },
      { platform: "Codeforces", name: "Majority Element", link: "https://codeforces.com/problemset/problem/844/A", score: 88 },
      { platform: "CodeChef", name: "Majority", link: "https://www.codechef.com/problems/MAJORITY", score: 85 },
      { platform: "HackerRank", name: "Majority Element", link: "https://www.hackerrank.com/challenges/majority-element", score: 85 }
    ]
  },
  {
    canonicalTitle: "Rotate array by k",
    topic: ["Array"],
    overallMatch: 91,
    platforms: [
      { platform: "LeetCode", name: "Rotate Array", link: "https://leetcode.com/problems/rotate-array/", score: 94 },
      { platform: "GFG", name: "Array Rotation", link: "https://www.geeksforgeeks.org/array-rotation/", score: 92 },
      { platform: "CodeChef", name: "Rotate the Array", link: "https://www.codechef.com/problems/ROTARR", score: 88 },
      { platform: "Codeforces", name: "Array Rotation", link: "https://codeforces.com/problemset/problem/999/A", score: 85 },
      { platform: "HackerRank", name: "Array Rotation", link: "https://www.hackerrank.com/challenges/array-left-rotation", score: 90 }
    ]
  },
  {
    canonicalTitle: "Merge overlapping intervals",
    topic: ["Sorting"],
    overallMatch: 94,
    platforms: [
      { platform: "LeetCode", name: "Merge Intervals", link: "https://leetcode.com/problems/merge-intervals/", score: 95 },
      { platform: "GFG", name: "Merge Overlapping Intervals", link: "https://www.geeksforgeeks.org/merging-intervals/", score: 94 },
      { platform: "CodeChef", name: "Merge Intervals", link: "https://www.codechef.com/problems/INTERVAL", score: 88 },
      { platform: "HackerRank", name: "Merge Intervals", link: "https://www.hackerrank.com/challenges/interval-selection", score: 85 },
      { platform: "AtCoder", name: "Interval Merge", link: "https://atcoder.jp/contests/abc256/tasks/abc256_d", score: 85 }
    ]
  },
  {
    canonicalTitle: "LCS",
    topic: ["DP"],
    overallMatch: 97,
    platforms: [
      { platform: "LeetCode", name: "Longest Common Subsequence", link: "https://leetcode.com/problems/longest-common-subsequence/", score: 98 },
      { platform: "GFG", name: "Longest Common Subsequence", link: "https://www.geeksforgeeks.org/longest-common-subsequence-dp-4/", score: 97 },
      { platform: "SPOJ", name: "LCS", link: "https://www.spoj.com/problems/LCS/", score: 96 },
      { platform: "Codeforces", name: "LCS", link: "https://codeforces.com/problemset/problem/4/D", score: 90 },
      { platform: "HackerRank", name: "LCS", link: "https://www.hackerrank.com/challenges/common-child", score: 92 }
    ]
  },
  {
    canonicalTitle: "Nth Fibonacci",
    topic: ["DP", "Math"],
    overallMatch: 96,
    platforms: [
      { platform: "LeetCode", name: "Fibonacci Number", link: "https://leetcode.com/problems/fibonacci-number/", score: 97 },
      { platform: "GFG", name: "Fibonacci Number", link: "https://www.geeksforgeeks.org/program-for-nth-fibonacci-number/", score: 96 },
      { platform: "Codeforces", name: "Fibonacci", link: "https://codeforces.com/problemset/problem/365/A", score: 90 },
      { platform: "CodeChef", name: "Fibonacci", link: "https://www.codechef.com/problems/FIBQ", score: 88 },
      { platform: "SPOJ", name: "FIBOSUM", link: "https://www.spoj.com/problems/FIBOSUM/", score: 90 }
    ]
  },
  {
    canonicalTitle: "Coin Change",
    topic: ["DP"],
    overallMatch: 88,
    platforms: [
      { platform: "LeetCode", name: "Coin Change", link: "https://leetcode.com/problems/coin-change/", score: 92 },
      { platform: "GFG", name: "Coin Change", link: "https://www.geeksforgeeks.org/coin-change-dp-7/", score: 90 },
      { platform: "SPOJ", name: "COINS", link: "https://www.spoj.com/problems/COINS/", score: 85 },
      { platform: "CodeChef", name: "Coin Change", link: "https://www.codechef.com/problems/COINS", score: 85 },
      { platform: "HackerRank", name: "Coin Change", link: "https://www.hackerrank.com/challenges/coin-change", score: 90 }
    ]
  },
  {
    canonicalTitle: "Check palindrome",
    topic: ["String"],
    overallMatch: 90,
    platforms: [
      { platform: "LeetCode", name: "Valid Palindrome", link: "https://leetcode.com/problems/valid-palindrome/", score: 93 },
      { platform: "GFG", name: "Palindrome String", link: "https://www.geeksforgeeks.org/check-if-a-string-is-palindrome/", score: 92 },
      { platform: "Codeforces", name: "Palindrome", link: "https://codeforces.com/problemset/problem/41/A", score: 88 },
      { platform: "CodeChef", name: "Palindrome", link: "https://www.codechef.com/problems/PALIN", score: 90 },
      { platform: "HackerRank", name: "Palindrome Index", link: "https://www.hackerrank.com/challenges/palindrome-index", score: 88 }
    ]
  },
  {
    canonicalTitle: "Count ways to reach nth stair",
    topic: ["DP"],
    overallMatch: 91,
    platforms: [
      { platform: "LeetCode", name: "Climbing Stairs", link: "https://leetcode.com/problems/climbing-stairs/", score: 94 },
      { platform: "GFG", name: "Count ways to reach nth stair", link: "https://www.geeksforgeeks.org/count-ways-reach-nth-stair/", score: 92 },
      { platform: "CodeChef", name: "Staircase", link: "https://www.codechef.com/problems/STAIR", score: 88 },
      { platform: "HackerRank", name: "Davis Staircase", link: "https://www.hackerrank.com/challenges/ctci-davis-staircase", score: 90 },
      { platform: "AtCoder", name: "Stair", link: "https://atcoder.jp/contests/dp/tasks/dp_a", score: 92 }
    ]
  },
  {
    canonicalTitle: "Binary tree inorder traversal",
    topic: ["Tree"],
    overallMatch: 96,
    platforms: [
      { platform: "LeetCode", name: "Binary Tree Inorder Traversal", link: "https://leetcode.com/problems/binary-tree-inorder-traversal/", score: 97 },
      { platform: "GFG", name: "Inorder Traversal", link: "https://www.geeksforgeeks.org/inorder-traversal-of-binary-tree/", score: 96 },
      { platform: "HackerRank", name: "Tree Inorder Traversal", link: "https://www.hackerrank.com/challenges/tree-inorder-traversal", score: 94 },
      { platform: "CodeChef", name: "Tree Traversal", link: "https://www.codechef.com/problems/TREEROOT", score: 88 },
      { platform: "SPOJ", name: "INVCNT", link: "https://www.spoj.com/problems/INVCNT/", score: 85 }
    ]
  },
  {
    canonicalTitle: "Breadth First Search",
    topic: ["Graph"],
    overallMatch: 90,
    platforms: [
      { platform: "GFG", name: "BFS of Graph", link: "https://www.geeksforgeeks.org/breadth-first-search-or-bfs-for-a-graph/", score: 95 },
      { platform: "Codeforces", name: "BFS", link: "https://codeforces.com/problemset/problem/110/A", score: 85 },
      { platform: "CodeChef", name: "BFS", link: "https://www.codechef.com/problems/BFS", score: 88 },
      { platform: "HackerRank", name: "BFS Shortest Reach", link: "https://www.hackerrank.com/challenges/bfsshortreach", score: 92 },
      { platform: "AtCoder", name: "BFS", link: "https://atcoder.jp/contests/abc007/tasks/abc007_3", score: 90 }
    ]
  },
  {
    canonicalTitle: "Depth First Search",
    topic: ["Graph"],
    overallMatch: 90,
    platforms: [
      { platform: "GFG", name: "DFS of Graph", link: "https://www.geeksforgeeks.org/depth-first-search-or-dfs-for-a-graph/", score: 95 },
      { platform: "Codeforces", name: "DFS", link: "https://codeforces.com/problemset/problem/522/A", score: 85 },
      { platform: "CodeChef", name: "DFS", link: "https://www.codechef.com/problems/DFS", score: 88 },
      { platform: "HackerRank", name: "DFS Connected Cell", link: "https://www.hackerrank.com/challenges/connected-cell-in-a-grid", score: 90 },
      { platform: "AtCoder", name: "DFS", link: "https://atcoder.jp/contests/abc213/tasks/abc213_d", score: 90 }
    ]
  },
  {
    canonicalTitle: "N Queen Problem",
    topic: ["Backtracking"],
    overallMatch: 97,
    platforms: [
      { platform: "LeetCode", name: "N-Queens", link: "https://leetcode.com/problems/n-queens/", score: 98 },
      { platform: "GFG", name: "N Queen Problem", link: "https://www.geeksforgeeks.org/n-queen-problem-backtracking-3/", score: 97 },
      { platform: "SPOJ", name: "NQUEEN", link: "https://www.spoj.com/problems/NQUEEN/", score: 95 },
      { platform: "CodeChef", name: "N Queens", link: "https://www.codechef.com/problems/NQUEEN", score: 90 },
      { platform: "HackerRank", name: "N Queens", link: "https://www.hackerrank.com/challenges/n-queens", score: 90 }
    ]
  },
  {
    canonicalTitle: "Merge Sort",
    topic: ["Sorting"],
    overallMatch: 92,
    platforms: [
      { platform: "GFG", name: "Merge Sort", link: "https://www.geeksforgeeks.org/merge-sort/", score: 95 },
      { platform: "HackerRank", name: "Merge Sort", link: "https://www.hackerrank.com/challenges/merge-sort", score: 90 },
      { platform: "CodeChef", name: "Merge Sort", link: "https://www.codechef.com/problems/MERGESORT", score: 88 },
      { platform: "SPOJ", name: "MERGESORT", link: "https://www.spoj.com/problems/MERGESORT/", score: 90 },
      { platform: "AtCoder", name: "Merge Sort", link: "https://atcoder.jp/contests/abc262/tasks/abc262_d", score: 85 }
    ]
  },
  {
    canonicalTitle: "Stack with getMin",
    topic: ["Stack"],
    overallMatch: 91,
    platforms: [
      { platform: "LeetCode", name: "Min Stack", link: "https://leetcode.com/problems/min-stack/", score: 94 },
      { platform: "GFG", name: "Special Stack", link: "https://www.geeksforgeeks.org/design-and-implement-special-stack-data-structure/", score: 92 },
      { platform: "CodeChef", name: "Min Stack", link: "https://www.codechef.com/problems/MINSTACK", score: 88 },
      { platform: "HackerRank", name: "Maximum Element", link: "https://www.hackerrank.com/challenges/maximum-element", score: 85 },
      { platform: "SPOJ", name: "STACKS", link: "https://www.spoj.com/problems/STACKS/", score: 85 }
    ]
  },
  {
    canonicalTitle: "Longest Palindromic Substring",
    topic: ["String", "DP"],
    overallMatch: 93,
    platforms: [
      { platform: "LeetCode", name: "Longest Palindromic Substring", link: "https://leetcode.com/problems/longest-palindromic-substring/", score: 95 },
      { platform: "GFG", name: "Longest Palindrome in a String", link: "https://www.geeksforgeeks.org/longest-palindrome-substring-set-1/", score: 94 },
      { platform: "Codeforces", name: "Palindrome Substring", link: "https://codeforces.com/problemset/problem/132/B", score: 88 },
      { platform: "SPOJ", name: "PALIN", link: "https://www.spoj.com/problems/PALIN/", score: 90 },
      { platform: "HackerRank", name: "Palindrome", link: "https://www.hackerrank.com/challenges/richie-rich", score: 85 }
    ]
  }
];

const run = async () => {
  await connectDb();

  // Seed Questions
  await CanonicalQuestion.deleteMany({});
  await CanonicalQuestion.insertMany(seedQuestions);
  console.log(`Seeded ${seedQuestions.length} canonical questions.`);

  // Seed Admin User
  const adminEmail = "admin@dsacompass.local";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("admin", 8);
    await User.create({
      name: "Admin",
      username: "admin",
      email: adminEmail,
      passwordHash,
      handles: {}
    });
    console.log("Seeded admin user (admin@dsacompass.local / admin)");
  } else {
    console.log("Admin user already exists.");
  }

  process.exit(0);
};

run().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});
