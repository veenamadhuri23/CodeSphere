import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProblemRow = {
  id: string;
  slug: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  starter_code: Record<string, string>;
  tags: string[];
  acceptance: number;
};

export type SubmissionRow = {
  id: string;
  problem_id: string;
  language: string;
  status: "accepted" | "wrong_answer" | "tle" | "runtime_error" | "compile_error";
  runtime_ms: number;
  memory_kb: number;
  created_at: string;
};

export const useProblems = () =>
  useQuery({
    queryKey: ["problems"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("problems")
        .select("*")
        .order("difficulty")
        .order("title");
      if (error) throw error;
      return data as unknown as ProblemRow[];
    },
  });

export const useProblem = (slug: string) =>
  useQuery({
    queryKey: ["problems", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("problems").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return (data as unknown as ProblemRow) ?? null;
    },
  });

export const useSubmissions = (userId: string | undefined) =>
  useQuery({
    queryKey: ["submissions", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as unknown as SubmissionRow[];
    },
  });

export const useMyProfile = (userId: string | undefined) =>
  useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const useLeaderboard = () =>
  useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, rating, streak, avatar_url, country")
        .order("rating", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });
