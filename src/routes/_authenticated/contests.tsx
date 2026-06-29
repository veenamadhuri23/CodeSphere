import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, Trophy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/contests")({
  head: () => ({ meta: [{ title: "Contests — Codiarc" }] }),
  component: ContestsPage,
});

const contests = [
  { name: "Weekly Contest #421", date: "Sun, Jul 6 · 10:30 AM", duration: "90 min", participants: 12_430, status: "upcoming" },
  { name: "Biweekly Contest #142", date: "Sat, Jul 12 · 8:00 PM", duration: "90 min", participants: 8_120, status: "upcoming" },
  { name: "Algorithms Cup 2026", date: "Fri, Jul 18 · 6:00 PM", duration: "150 min", participants: 2_340, status: "upcoming" },
];

const past = [
  { name: "Weekly Contest #420", rank: "—", solved: "—", date: "Jun 29" },
  { name: "Spring Showdown", rank: "—", solved: "—", date: "Jun 22" },
];

function ContestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Contests</h1>
        <p className="text-muted-foreground">Compete live with developers worldwide.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {contests.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card relative overflow-hidden rounded-2xl p-6"
          >
            <div className="absolute -right-10 -top-10 size-40 rounded-full opacity-30 blur-3xl" style={{ background: "var(--gradient-primary)" }} />
            <Trophy className="size-6 text-primary" />
            <h3 className="mt-3 font-display text-lg font-bold">{c.name}</h3>
            <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Calendar className="size-3.5" /> {c.date}</div>
              <div className="flex items-center gap-2"><Clock className="size-3.5" /> {c.duration}</div>
              <div className="flex items-center gap-2"><Users className="size-3.5" /> {c.participants.toLocaleString()} registered</div>
            </div>
            <button
              onClick={() => toast.success(`Registered for ${c.name}!`)}
              className="btn-glow mt-5 w-full rounded-xl py-2.5 text-sm font-semibold"
            >
              Register
            </button>
          </motion.div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-semibold">Past Contests</h3>
        <div className="mt-4 divide-y divide-border">
          {past.map((p) => (
            <div key={p.name} className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.date}</div>
              </div>
              <div className="flex gap-6 text-sm text-muted-foreground">
                <span>Rank: {p.rank}</span><span>Solved: {p.solved}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
