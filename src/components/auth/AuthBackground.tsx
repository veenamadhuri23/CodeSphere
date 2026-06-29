import { motion } from "framer-motion";

const SNIPPETS = [
  "function twoSum(nums, target) {",
  "  const map = new Map();",
  "  for (let i = 0; i < n; i++) {",
  "    if (map.has(target - nums[i])) return [map.get(t), i];",
  "  }",
  "}",
  "class Solution: pass",
  "const dp = new Array(n+1).fill(0);",
  "// O(n log n)",
];

export function AuthBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* gradient blobs */}
      <div className="absolute -left-32 top-1/4 size-96 rounded-full opacity-40 blur-3xl animate-blob" style={{ background: "oklch(0.65 0.18 250 / 0.6)" }} />
      <div className="absolute right-0 top-2/3 size-96 rounded-full opacity-40 blur-3xl animate-blob" style={{ background: "oklch(0.82 0.16 195 / 0.5)", animationDelay: "-6s" }} />
      <div className="absolute left-1/3 -bottom-32 size-80 rounded-full opacity-30 blur-3xl animate-blob" style={{ background: "oklch(0.55 0.22 270 / 0.5)", animationDelay: "-10s" }} />

      {/* particles */}
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute size-1 rounded-full bg-cyan/60"
          style={{ left: `${(i * 37) % 100}%`, top: `${(i * 23) % 100}%` }}
          animate={{ y: [0, -40, 0], opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: i * 0.2 }}
        />
      ))}

      {/* floating code snippets */}
      {SNIPPETS.map((s, i) => (
        <motion.div
          key={i}
          className="absolute font-mono text-[11px] text-foreground/30"
          style={{ left: `${5 + ((i * 13) % 80)}%`, top: `${10 + ((i * 17) % 75)}%` }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6 + (i % 3), repeat: Infinity, delay: i * 0.4 }}
        >
          {s}
        </motion.div>
      ))}
    </div>
  );
}
