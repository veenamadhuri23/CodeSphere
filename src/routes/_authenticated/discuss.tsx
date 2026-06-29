import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MessageSquare, ThumbsUp, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/discuss")({
  head: () => ({ meta: [{ title: "Discuss — Codiarc" }] }),
  component: DiscussPage,
});

const threads = [
  { title: "How I solved Trapping Rain Water in O(n) without stack", author: "alex_dev", tag: "Two Pointers", up: 348, replies: 42, time: "2h ago" },
  { title: "Best way to learn DP? My 6-month roadmap", author: "dp_master", tag: "Dynamic Programming", up: 1240, replies: 198, time: "5h ago" },
  { title: "Just got an offer from Google — my prep notes", author: "interview_pro", tag: "Career", up: 4502, replies: 312, time: "1d ago" },
  { title: "LRU Cache: linked hashmap vs doubly linked list?", author: "ds_geek", tag: "Design", up: 87, replies: 23, time: "2d ago" },
  { title: "Weekly Contest #420 — Q3 discussion", author: "contest_fan", tag: "Contests", up: 56, replies: 81, time: "3d ago" },
];

function DiscussPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Discuss</h1>
        <p className="text-muted-foreground">Learn from the community. Share what you know.</p>
      </div>

      <div className="glass-card rounded-2xl">
        {threads.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-4 border-b border-border p-5 last:border-b-0 hover:bg-glass"
          >
            <div className="grid size-10 place-items-center rounded-xl bg-glass">
              <MessageSquare className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium hover:text-primary cursor-pointer">{t.title}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>by @{t.author}</span>
                <span>·</span>
                <span className="rounded-md bg-muted px-2 py-0.5">{t.tag}</span>
                <span>·</span>
                <span>{t.time}</span>
              </div>
            </div>
            <div className="hidden items-center gap-4 text-xs text-muted-foreground sm:flex">
              <span className="flex items-center gap-1"><ThumbsUp className="size-3.5" /> {t.up}</span>
              <span className="flex items-center gap-1"><MessageCircle className="size-3.5" /> {t.replies}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
