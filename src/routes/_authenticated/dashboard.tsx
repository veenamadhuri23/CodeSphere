import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Flame, Trophy, Target, TrendingUp, Calendar, Play, Award, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLeaderboard, useMyProfile, useProblems, useSubmissions } from "@/lib/queries";
import { useMemo } from "react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Codiarc" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { data: profile } = useMyProfile(user?.id);
  const { data: problems } = useProblems();
  const { data: submissions } = useSubmissions(user?.id);
  const { data: leaderboard } = useLeaderboard();

  const solvedIds = useMemo(
    () => new Set((submissions ?? []).filter((s) => s.status === "accepted").map((s) => s.problem_id)),
    [submissions]
  );
  const solvedProblems = (problems ?? []).filter((p) => solvedIds.has(p.id));
  const stats = {
    total: solvedProblems.length,
    easy: solvedProblems.filter((p) => p.difficulty === "easy").length,
    medium: solvedProblems.filter((p) => p.difficulty === "medium").length,
    hard: solvedProblems.filter((p) => p.difficulty === "hard").length,
  };
  const daily = problems?.[0];

  // Heatmap (last 12 weeks * 7 days)
  const heatmap = useMemo(() => {
    const map = new Map<string, number>();
    (submissions ?? []).forEach((s) => {
      const d = new Date(s.created_at).toISOString().slice(0, 10);
      map.set(d, (map.get(d) ?? 0) + 1);
    });
    const cells: { date: string; count: number }[] = [];
    const today = new Date();
    for (let i = 12 * 7 - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      cells.push({ date: key, count: map.get(key) ?? 0 });
    }
    return cells;
  }, [submissions]);

  const username = profile?.username ?? user?.email?.split("@")[0] ?? "coder";

  return (
    <div className="space-y-6">
      {/* welcome */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card-strong relative overflow-hidden rounded-3xl p-8">
        <div className="absolute -right-20 -top-20 size-64 rounded-full opacity-30 blur-3xl" style={{ background: "var(--gradient-primary)" }} />
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
          @{username} <span className="text-gradient">👋</span>
        </h1>
        <p className="mt-2 max-w-lg text-muted-foreground">You're on a {profile?.streak ?? 0}-day streak. Keep the momentum going!</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {daily && (
            <Link to="/problems/$slug" params={{ slug: daily.slug }} className="btn-glow inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium">
              <Zap className="size-4" /> Daily Challenge: {daily.title}
            </Link>
          )}
          <Link to="/problems" className="inline-flex items-center gap-2 rounded-xl border border-border bg-glass px-5 py-3 font-medium hover:bg-card">
            <Play className="size-4" /> Continue Solving
          </Link>
        </div>
      </motion.div>

      {/* stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Solved" value={stats.total} icon={Target} accent="primary" />
        <StatCard label="Easy" value={stats.easy} icon={Trophy} accent="success" />
        <StatCard label="Medium" value={stats.medium} icon={Award} accent="warning" />
        <StatCard label="Hard" value={stats.hard} icon={Flame} accent="destructive" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* heatmap */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Activity</h3>
              <p className="text-sm text-muted-foreground">{submissions?.length ?? 0} submissions in the last 12 weeks</p>
            </div>
            <Calendar className="size-5 text-muted-foreground" />
          </div>
          <div className="mt-5 grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto">
            {heatmap.map((c) => (
              <div
                key={c.date}
                title={`${c.date}: ${c.count} submissions`}
                className="size-3 rounded-sm transition-transform hover:scale-150"
                style={{
                  background:
                    c.count === 0
                      ? "oklch(1 0 0 / 0.05)"
                      : c.count < 2
                      ? "oklch(0.55 0.14 230 / 0.5)"
                      : c.count < 5
                      ? "oklch(0.65 0.18 230 / 0.8)"
                      : "var(--primary)",
                }}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-end gap-2 text-xs text-muted-foreground">
            Less
            {[0.05, 0.5, 0.8, 1].map((o, i) => (
              <div key={i} className="size-3 rounded-sm" style={{ background: `oklch(0.65 0.18 230 / ${o})` }} />
            ))}
            More
          </div>
        </motion.div>

        {/* rating */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Contest Rating</h3>
            <TrendingUp className="size-5 text-muted-foreground" />
          </div>
          <p className="mt-4 font-display text-5xl font-bold text-gradient">{profile?.rating ?? 1500}</p>
          <p className="mt-1 text-sm text-muted-foreground">Global rank #{Math.max(1, 4200 - (profile?.rating ?? 1500))}</p>
          <div className="mt-5 space-y-2">
            <Row label="Current streak" value={`${profile?.streak ?? 0} days`} />
            <Row label="Acceptance rate" value={`${Math.round((stats.total / Math.max(1, submissions?.length ?? 1)) * 100)}%`} />
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* recent submissions */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold">Recent Submissions</h3>
          <div className="mt-4 divide-y divide-border">
            {(submissions ?? []).slice(0, 6).map((s) => {
              const p = problems?.find((p) => p.id === s.problem_id);
              return (
                <Link
                  key={s.id}
                  to="/problems/$slug"
                  params={{ slug: p?.slug ?? "two-sum" }}
                  className="flex items-center justify-between py-3 hover:opacity-80"
                >
                  <div>
                    <div className="text-sm font-medium">{p?.title ?? "Problem"}</div>
                    <div className="text-xs text-muted-foreground">{s.language} · {new Date(s.created_at).toLocaleString()}</div>
                  </div>
                  <StatusBadge status={s.status} />
                </Link>
              );
            })}
            {!submissions?.length && <p className="py-6 text-center text-sm text-muted-foreground">No submissions yet — solve your first problem!</p>}
          </div>
        </motion.div>

        {/* leaderboard preview */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Top Coders</h3>
            <Link to="/leaderboard" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="mt-4 space-y-3">
            {(leaderboard ?? []).slice(0, 6).map((u, i) => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="grid size-7 place-items-center rounded-md bg-glass text-xs font-bold">{i + 1}</div>
                <div className="grid size-9 place-items-center rounded-full text-sm font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                  {(u.username ?? "U").slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 truncate">
                  <div className="truncate text-sm font-medium">@{u.username}</div>
                  <div className="text-xs text-muted-foreground">{u.country || "—"}</div>
                </div>
                <div className="text-sm font-semibold text-gradient">{u.rating}</div>
              </div>
            ))}
            {!leaderboard?.length && <p className="py-6 text-center text-sm text-muted-foreground">Be the first on the leaderboard!</p>}
          </div>
        </motion.div>
      </div>

      {/* recommended */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Recommended for you</h3>
          <Link to="/problems" className="text-xs text-primary hover:underline">All problems</Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {(problems ?? []).slice(0, 6).map((p) => (
            <Link
              key={p.id}
              to="/problems/$slug"
              params={{ slug: p.slug }}
              className="group rounded-xl border border-border bg-glass p-4 transition hover:border-primary hover:shadow-[0_0_20px_oklch(0.65_0.18_250/0.3)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{p.title}</span>
                <DifficultyChip d={p.difficulty} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {p.tags.slice(0, 3).map((t) => (
                  <span key={t} className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{t}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: number; icon: any; accent: string }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="glass-card relative overflow-hidden rounded-2xl p-5">
      <div className="absolute -right-4 -top-4 size-20 rounded-full opacity-20 blur-2xl" style={{ background: `var(--${accent})` }} />
      <Icon className="size-5 text-muted-foreground" />
      <div className="mt-3 font-display text-3xl font-bold">{value}</div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
    </motion.div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export function DifficultyChip({ d }: { d: "easy" | "medium" | "hard" }) {
  const map = {
    easy: "bg-success/15 text-success",
    medium: "bg-warning/15 text-warning",
    hard: "bg-destructive/15 text-destructive",
  } as const;
  return <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ${map[d]}`}>{d}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    accepted: "bg-success/15 text-success",
    wrong_answer: "bg-destructive/15 text-destructive",
    tle: "bg-warning/15 text-warning",
    runtime_error: "bg-destructive/15 text-destructive",
    compile_error: "bg-destructive/15 text-destructive",
  };
  const label = status.replace("_", " ");
  return <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ${map[status] ?? "bg-muted text-muted-foreground"}`}>{label}</span>;
}
