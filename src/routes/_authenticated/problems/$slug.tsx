import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import { ChevronLeft, Play, Send, Loader2, BookOpen, Tag } from "lucide-react";
import { useProblem } from "@/lib/queries";
import { DifficultyChip, StatusBadge } from "../dashboard";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/problems/$slug")({
  head: ({ params }) => ({ meta: [{ title: `${params.slug} — Codiarc` }] }),
  component: ProblemDetail,
});

type Lang = "javascript" | "typescript" | "python";

function ProblemDetail() {
  const { slug } = Route.useParams();
  const { data: problem, isLoading } = useProblem(slug);
  const [lang, setLang] = useState<Lang>("javascript");
  const [code, setCode] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verdict, setVerdict] = useState<null | { status: string; runtime: number; memory: number; cases: number }>(null);
  const { user } = useAuth();
  const qc = useQueryClient();

  // sync code when problem loads / lang changes
  const starter = problem?.starter_code?.[lang] ?? "";
  const effectiveCode = code || starter;

  const mockRun = async (submit: boolean) => {
    if (submit) setSubmitting(true); else setRunning(true);
    setVerdict(null);
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 700));
    const codeLen = (effectiveCode || "").trim().length;
    const looksImpl = codeLen > (starter?.length ?? 0) + 15;
    const roll = Math.random();
    let status: "accepted" | "wrong_answer" | "tle" | "runtime_error";
    if (!looksImpl) status = "wrong_answer";
    else if (roll < 0.7) status = "accepted";
    else if (roll < 0.85) status = "wrong_answer";
    else if (roll < 0.95) status = "tle";
    else status = "runtime_error";

    const runtime = Math.floor(40 + Math.random() * 200);
    const memory = Math.floor(12000 + Math.random() * 5000);
    setVerdict({ status, runtime, memory, cases: status === "accepted" ? 50 : Math.floor(Math.random() * 40) });

    if (submit && user && problem) {
      const { error } = await supabase.from("submissions").insert({
        user_id: user.id,
        problem_id: problem.id,
        language: lang,
        code: effectiveCode,
        status,
        runtime_ms: runtime,
        memory_kb: memory,
      });
      if (error) toast.error("Failed to save submission");
      else {
        qc.invalidateQueries({ queryKey: ["submissions"] });
        if (status === "accepted") toast.success("Accepted! 🎉");
        else toast.error(`Verdict: ${status.replace("_", " ")}`);
      }
    } else if (!submit) {
      toast.info("Test run complete (sample case)");
    }

    if (submit) setSubmitting(false); else setRunning(false);
  };

  if (isLoading) return <div className="grid h-[60vh] place-items-center text-muted-foreground"><Loader2 className="size-6 animate-spin" /></div>;
  if (!problem) return <div className="glass-card rounded-2xl p-10 text-center">Problem not found.</div>;

  return (
    <div className="space-y-4">
      <Link to="/problems" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Back to problems
      </Link>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* LEFT — description */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <BookOpen className="size-5 text-muted-foreground" />
            <h1 className="font-display text-2xl font-bold">{problem.title}</h1>
            <DifficultyChip d={problem.difficulty} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {problem.tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                <Tag className="size-3" /> {t}
              </span>
            ))}
          </div>
          <p className="mt-5 whitespace-pre-line text-sm leading-relaxed">{problem.description}</p>

          <h3 className="mt-6 font-semibold">Examples</h3>
          <div className="mt-2 space-y-3">
            {problem.examples.map((e, i) => (
              <div key={i} className="rounded-xl border border-border bg-background/40 p-4 font-mono text-xs">
                <div><span className="text-muted-foreground">Input:</span> {e.input}</div>
                <div><span className="text-muted-foreground">Output:</span> {e.output}</div>
                {e.explanation && <div className="mt-1 text-muted-foreground">{e.explanation}</div>}
              </div>
            ))}
          </div>

          <h3 className="mt-6 font-semibold">Constraints</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {problem.constraints.map((c, i) => <li key={i} className="font-mono text-xs">{c}</li>)}
          </ul>
        </motion.div>

        {/* RIGHT — editor */}
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="glass-card flex flex-col overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-background/40 px-4 py-3">
            <select
              value={lang}
              onChange={(e) => { setLang(e.target.value as Lang); setCode(""); }}
              className="rounded-lg border border-border bg-glass px-3 py-1.5 text-xs font-medium outline-none focus:border-primary"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => mockRun(false)}
                disabled={running || submitting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-glass px-3 py-1.5 text-xs font-medium hover:bg-card disabled:opacity-50"
              >
                {running ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />} Run
              </button>
              <button
                onClick={() => mockRun(true)}
                disabled={running || submitting}
                className="btn-glow inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold disabled:opacity-50"
              >
                {submitting ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />} Submit
              </button>
            </div>
          </div>
          <div className="h-[460px]">
            <Editor
              key={lang}
              language={lang === "python" ? "python" : lang}
              value={effectiveCode}
              onChange={(v) => setCode(v ?? "")}
              theme="vs-dark"
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                fontFamily: "JetBrains Mono, monospace",
                scrollBeyondLastLine: false,
                tabSize: 2,
                padding: { top: 14 },
              }}
            />
          </div>

          <AnimatePresence>
            {verdict && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="border-t border-border bg-background/40 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={verdict.status} />
                    <span className="text-sm">{verdict.cases}/50 test cases</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{verdict.runtime} ms · {(verdict.memory / 1024).toFixed(1)} MB</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
