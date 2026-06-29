import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import { useState } from "react";
import { useProblems } from "@/lib/queries";
import { DifficultyChip } from "./dashboard";

export const Route = createFileRoute("/_authenticated/problems/")({
  head: () => ({ meta: [{ title: "Problems — Codiarc" }] }),
  component: ProblemsList,
});

function ProblemsList() {
  const { data, isLoading } = useProblems();
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState<"all" | "easy" | "medium" | "hard">("all");

  const filtered = (data ?? []).filter((p) => {
    if (diff !== "all" && p.difficulty !== diff) return false;
    if (q && !p.title.toLowerCase().includes(q.toLowerCase()) && !p.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Problems</h1>
        <p className="text-muted-foreground">Sharpen your skills with curated challenges.</p>
      </div>

      <div className="glass-card flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search title or tag…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-xl border border-border bg-glass py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          {(["all", "easy", "medium", "hard"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDiff(d)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                diff === d ? "btn-glow text-primary-foreground" : "border border-border bg-glass hover:bg-card"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3">#</th>
              <th className="px-5 py-3">Title</th>
              <th className="hidden px-5 py-3 md:table-cell">Tags</th>
              <th className="px-5 py-3">Difficulty</th>
              <th className="hidden px-5 py-3 sm:table-cell">Acceptance</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="border-b border-border">
                <td colSpan={5} className="px-5 py-4"><div className="h-6 w-full shimmer-bg rounded" /></td>
              </tr>
            ))}
            {filtered.map((p, i) => (
              <motion.tr
                key={p.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-border transition hover:bg-glass"
              >
                <td className="px-5 py-4 text-muted-foreground">{i + 1}</td>
                <td className="px-5 py-4">
                  <Link to="/problems/$slug" params={{ slug: p.slug }} className="font-medium hover:text-primary">
                    {p.title}
                  </Link>
                </td>
                <td className="hidden px-5 py-4 md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {p.tags.slice(0, 3).map((t) => (
                      <span key={t} className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{t}</span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4"><DifficultyChip d={p.difficulty} /></td>
                <td className="hidden px-5 py-4 text-muted-foreground sm:table-cell">{p.acceptance}%</td>
              </motion.tr>
            ))}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">No problems match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
