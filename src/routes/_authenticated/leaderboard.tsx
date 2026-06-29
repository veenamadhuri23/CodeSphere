import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Trophy, Crown, Medal } from "lucide-react";
import { useLeaderboard } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — Codiarc" }] }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const { data, isLoading } = useLeaderboard();
  const list = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground">Top coders ranked by rating.</p>
      </div>

      {/* podium */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 0, 2].map((idx, pos) => {
          const u = list[idx];
          if (!u) return <div key={pos} className="glass-card rounded-2xl p-6 text-center text-muted-foreground">—</div>;
          const heights = ["h-40", "h-48", "h-36"];
          const icons = [Medal, Crown, Trophy];
          const Ic = icons[pos];
          const colors = ["text-zinc-300", "text-yellow-400", "text-amber-600"];
          return (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: pos * 0.1 }}
              className={`glass-card-strong relative flex flex-col items-center justify-end rounded-2xl p-6 ${heights[pos]}`}
            >
              <Ic className={`mb-2 size-8 ${colors[pos]}`} />
              <div className="grid size-12 place-items-center rounded-full text-sm font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                {(u.username ?? "?").slice(0, 1).toUpperCase()}
              </div>
              <div className="mt-2 font-semibold">@{u.username}</div>
              <div className="text-sm text-gradient font-bold">{u.rating}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="glass-card overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3">Rank</th>
              <th className="px-5 py-3">User</th>
              <th className="hidden px-5 py-3 sm:table-cell">Country</th>
              <th className="px-5 py-3">Rating</th>
              <th className="hidden px-5 py-3 sm:table-cell">Streak</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="border-b border-border">
                <td colSpan={5} className="px-5 py-4"><div className="h-6 w-full shimmer-bg rounded" /></td>
              </tr>
            ))}
            {list.map((u, i) => (
              <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-border hover:bg-glass">
                <td className="px-5 py-3 font-semibold">{i + 1}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="grid size-8 place-items-center rounded-full text-xs font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                      {(u.username ?? "?").slice(0, 1).toUpperCase()}
                    </div>
                    @{u.username}
                  </div>
                </td>
                <td className="hidden px-5 py-3 text-muted-foreground sm:table-cell">{u.country || "—"}</td>
                <td className="px-5 py-3 font-semibold text-gradient">{u.rating}</td>
                <td className="hidden px-5 py-3 text-muted-foreground sm:table-cell">{u.streak} 🔥</td>
              </motion.tr>
            ))}
            {!isLoading && list.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">No rankings yet. Be the first!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
