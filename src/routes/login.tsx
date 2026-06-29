import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Mail, Lock, Trophy, Target, Users, Sparkles } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { Logo } from "@/components/layout/Logo";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
  remember: z.boolean().optional(),
});
type Form = z.infer<typeof schema>;

export const Route = createFileRoute("/login")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  head: () => ({ meta: [{ title: "Sign in — Codiarc" }] }),
  component: LoginPage,
});

const FEATURES = [
  { icon: Target, title: "Practice Coding", desc: "1000+ curated problems" },
  { icon: Sparkles, title: "Track Progress", desc: "Heatmap, streaks, ratings" },
  { icon: Users, title: "Compete & Learn", desc: "Weekly live contests" },
  { icon: Trophy, title: "Get Hired", desc: "Interview-ready challenges" },
];

function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async (v: Form) => {
    const { error } = await supabase.auth.signInWithPassword({ email: v.email, password: v.password });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden lg:grid lg:grid-cols-2">
      <AuthBackground />

      {/* LEFT */}
      <div className="relative z-10 hidden flex-col justify-between p-10 lg:flex xl:p-16">
        <Logo />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="font-display text-5xl font-bold leading-[1.05] xl:text-6xl">
            Level up your <br />
            <span className="text-gradient">coding skills</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            Join 50,000+ developers practicing on the most beautiful judge platform on the web.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-3 max-w-md">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                className="glass-card rounded-2xl p-4"
              >
                <div className="grid size-9 place-items-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
                  <f.icon className="size-4 text-primary-foreground" />
                </div>
                <div className="mt-3 text-sm font-semibold">{f.title}</div>
                <div className="text-xs text-muted-foreground">{f.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <div className="text-xs text-muted-foreground">© Codiarc · Built for developers.</div>
      </div>

      {/* RIGHT */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-card-strong w-full max-w-md rounded-3xl p-8"
        >
          <div className="lg:hidden mb-6"><Logo /></div>
          <h2 className="font-display text-2xl font-bold">Welcome back</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to continue your streak.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Field icon={Mail} type="email" placeholder="you@example.com" {...register("email")} error={errors.email?.message} />
            <Field
              icon={Lock}
              type={showPw ? "text" : "password"}
              placeholder="Password"
              {...register("password")}
              error={errors.password?.message}
              right={
                <button type="button" onClick={() => setShowPw((v) => !v)} className="text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              }
            />
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" {...register("remember")} className="accent-primary" /> Remember me
              </label>
              <button type="button" onClick={() => toast.info("Password reset coming soon — contact support.")} className="text-primary hover:underline">
                Forgot password?
              </button>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-glow w-full rounded-xl py-3 font-semibold disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="mx-auto size-5 animate-spin" /> : "Sign in"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> OR CONTINUE WITH <div className="h-px flex-1 bg-border" />
          </div>

          <SocialButtons onAfterAuth={() => navigate({ to: "/dashboard" })} />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">Create account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

const Field = ({ icon: Icon, error, right, ...props }: any) => (
  <div>
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        {...props}
        className="w-full rounded-xl border border-border bg-glass py-3 pl-10 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
      {right && <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>}
    </div>
    {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
  </div>
);
