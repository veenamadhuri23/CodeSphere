
-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  bio TEXT DEFAULT '',
  country TEXT DEFAULT '',
  institution TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  github TEXT DEFAULT '',
  linkedin TEXT DEFAULT '',
  skills TEXT[] DEFAULT '{}',
  rating INT NOT NULL DEFAULT 1500,
  streak INT NOT NULL DEFAULT 0,
  last_solved_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- PROBLEMS
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');

CREATE TABLE public.problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  difficulty difficulty_level NOT NULL,
  description TEXT NOT NULL,
  examples JSONB NOT NULL DEFAULT '[]'::jsonb,
  constraints TEXT[] NOT NULL DEFAULT '{}',
  starter_code JSONB NOT NULL DEFAULT '{}'::jsonb,
  tags TEXT[] NOT NULL DEFAULT '{}',
  acceptance NUMERIC NOT NULL DEFAULT 50.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.problems TO authenticated, anon;
GRANT ALL ON public.problems TO service_role;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Problems are viewable by everyone" ON public.problems FOR SELECT USING (true);

-- SUBMISSIONS
CREATE TYPE submission_status AS ENUM ('accepted', 'wrong_answer', 'tle', 'runtime_error', 'compile_error');

CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  code TEXT NOT NULL,
  status submission_status NOT NULL,
  runtime_ms INT NOT NULL DEFAULT 0,
  memory_kb INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own submissions" ON public.submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX submissions_user_created_idx ON public.submissions(user_id, created_at DESC);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INT := 0;
BEGIN
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  base_username := regexp_replace(base_username, '[^a-zA-Z0-9_]', '', 'g');
  IF base_username = '' THEN base_username := 'user'; END IF;
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::text;
  END LOOP;
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (NEW.id, final_username, COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SEED PROBLEMS
INSERT INTO public.problems (slug, title, difficulty, description, examples, constraints, starter_code, tags, acceptance) VALUES
('two-sum', 'Two Sum', 'easy',
 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
 '[{"input":"nums = [2,7,11,15], target = 9","output":"[0,1]","explanation":"Because nums[0] + nums[1] == 9, we return [0, 1]."}]'::jsonb,
 ARRAY['2 <= nums.length <= 10^4','-10^9 <= nums[i] <= 10^9','Only one valid answer exists.'],
 '{"javascript":"function twoSum(nums, target) {\n  // Write your code here\n}","python":"def two_sum(nums, target):\n    # Write your code here\n    pass","typescript":"function twoSum(nums: number[], target: number): number[] {\n  // Write your code here\n  return [];\n}"}'::jsonb,
 ARRAY['Array','Hash Table'], 52.3),
('reverse-string', 'Reverse String', 'easy',
 'Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.',
 '[{"input":"s = [\"h\",\"e\",\"l\",\"l\",\"o\"]","output":"[\"o\",\"l\",\"l\",\"e\",\"h\"]"}]'::jsonb,
 ARRAY['1 <= s.length <= 10^5'],
 '{"javascript":"function reverseString(s) {\n  // in-place\n}","python":"def reverse_string(s):\n    pass","typescript":"function reverseString(s: string[]): void {\n  // in-place\n}"}'::jsonb,
 ARRAY['Two Pointers','String'], 78.1),
('valid-parentheses', 'Valid Parentheses', 'easy',
 'Given a string s containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid.',
 '[{"input":"s = \"()[]{}\"","output":"true"},{"input":"s = \"(]\"","output":"false"}]'::jsonb,
 ARRAY['1 <= s.length <= 10^4'],
 '{"javascript":"function isValid(s) {\n}","python":"def is_valid(s):\n    pass","typescript":"function isValid(s: string): boolean {\n  return false;\n}"}'::jsonb,
 ARRAY['Stack','String'], 41.2),
('merge-intervals', 'Merge Intervals', 'medium',
 'Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
 '[{"input":"intervals = [[1,3],[2,6],[8,10],[15,18]]","output":"[[1,6],[8,10],[15,18]]"}]'::jsonb,
 ARRAY['1 <= intervals.length <= 10^4'],
 '{"javascript":"function merge(intervals) {\n}","python":"def merge(intervals):\n    pass","typescript":"function merge(intervals: number[][]): number[][] {\n  return [];\n}"}'::jsonb,
 ARRAY['Array','Sorting'], 46.8),
('longest-substring', 'Longest Substring Without Repeating Characters', 'medium',
 'Given a string s, find the length of the longest substring without repeating characters.',
 '[{"input":"s = \"abcabcbb\"","output":"3","explanation":"The answer is \"abc\", with the length of 3."}]'::jsonb,
 ARRAY['0 <= s.length <= 5 * 10^4'],
 '{"javascript":"function lengthOfLongestSubstring(s) {\n}","python":"def length_of_longest_substring(s):\n    pass","typescript":"function lengthOfLongestSubstring(s: string): number {\n  return 0;\n}"}'::jsonb,
 ARRAY['Hash Table','Sliding Window'], 34.5),
('lru-cache', 'LRU Cache', 'medium',
 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.',
 '[{"input":"LRUCache(2); put(1,1); put(2,2); get(1); put(3,3); get(2);","output":"[null,null,null,1,null,-1]"}]'::jsonb,
 ARRAY['1 <= capacity <= 3000'],
 '{"javascript":"class LRUCache {\n  constructor(capacity) {}\n  get(key) {}\n  put(key, value) {}\n}","python":"class LRUCache:\n    def __init__(self, capacity):\n        pass","typescript":"class LRUCache {\n  constructor(capacity: number) {}\n  get(key: number): number { return -1; }\n  put(key: number, value: number): void {}\n}"}'::jsonb,
 ARRAY['Hash Table','Linked List','Design'], 40.1),
('binary-tree-inorder', 'Binary Tree Inorder Traversal', 'easy',
 'Given the root of a binary tree, return the inorder traversal of its nodes'' values.',
 '[{"input":"root = [1,null,2,3]","output":"[1,3,2]"}]'::jsonb,
 ARRAY['The number of nodes in the tree is in the range [0, 100].'],
 '{"javascript":"function inorderTraversal(root) {\n}","python":"def inorder_traversal(root):\n    pass","typescript":"function inorderTraversal(root: TreeNode | null): number[] {\n  return [];\n}"}'::jsonb,
 ARRAY['Stack','Tree','DFS'], 75.0),
('word-ladder', 'Word Ladder', 'hard',
 'A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words where each adjacent pair differs by a single letter.',
 '[{"input":"beginWord = \"hit\", endWord = \"cog\", wordList = [\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"cog\"]","output":"5"}]'::jsonb,
 ARRAY['1 <= beginWord.length <= 10'],
 '{"javascript":"function ladderLength(beginWord, endWord, wordList) {\n}","python":"def ladder_length(begin, end, words):\n    pass","typescript":"function ladderLength(beginWord: string, endWord: string, wordList: string[]): number {\n  return 0;\n}"}'::jsonb,
 ARRAY['Hash Table','String','BFS'], 38.4),
('trapping-rain-water', 'Trapping Rain Water', 'hard',
 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
 '[{"input":"height = [0,1,0,2,1,0,1,3,2,1,2,1]","output":"6"}]'::jsonb,
 ARRAY['n == height.length'],
 '{"javascript":"function trap(height) {\n}","python":"def trap(height):\n    pass","typescript":"function trap(height: number[]): number {\n  return 0;\n}"}'::jsonb,
 ARRAY['Array','Two Pointers','DP'], 60.2),
('median-sorted-arrays', 'Median of Two Sorted Arrays', 'hard',
 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).',
 '[{"input":"nums1 = [1,3], nums2 = [2]","output":"2.00000"}]'::jsonb,
 ARRAY['nums1.length == m'],
 '{"javascript":"function findMedianSortedArrays(a, b) {\n}","python":"def find_median_sorted_arrays(a, b):\n    pass","typescript":"function findMedianSortedArrays(nums1: number[], nums2: number[]): number {\n  return 0;\n}"}'::jsonb,
 ARRAY['Array','Binary Search','Divide and Conquer'], 39.7),
('climbing-stairs', 'Climbing Stairs', 'easy',
 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
 '[{"input":"n = 3","output":"3","explanation":"1+1+1, 1+2, 2+1"}]'::jsonb,
 ARRAY['1 <= n <= 45'],
 '{"javascript":"function climbStairs(n) {\n}","python":"def climb_stairs(n):\n    pass","typescript":"function climbStairs(n: number): number {\n  return 0;\n}"}'::jsonb,
 ARRAY['Math','DP','Memoization'], 52.7),
('container-with-most-water', 'Container With Most Water', 'medium',
 'You are given an integer array height of length n. Find two lines that together with the x-axis form a container, such that the container contains the most water.',
 '[{"input":"height = [1,8,6,2,5,4,8,3,7]","output":"49"}]'::jsonb,
 ARRAY['n == height.length'],
 '{"javascript":"function maxArea(height) {\n}","python":"def max_area(height):\n    pass","typescript":"function maxArea(height: number[]): number {\n  return 0;\n}"}'::jsonb,
 ARRAY['Array','Two Pointers','Greedy'], 56.0);
