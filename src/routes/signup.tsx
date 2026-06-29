import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMemo, useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, User, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { Logo } from "@/components/layout/Logo";

const schema = z
  .object({
    username: z.string().trim().min(3, "Min 3 characters").max(20, "Max 20 chars").regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, underscore"),
    email: z.string().trim().email("Enter a valid email"),
    password: z.string().min(8, "Min 8 characters"),
    confirm: z.string(),
    terms: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) }),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

type Form = z.infer<typeof schema>;

export const Route = createFileRoute("/signup")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  head: () => ({ meta: [{ title: "Create account — Codiarc" }] }),
  component: SignupPage,
});

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0..4
}

function SignupPage() {
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", email: "", password: "", confirm: "", terms: false as unknown as true },
  });

  const pw = watch("password") ?? "";
  const score = useMemo(() => strength(pw), [pw]);
  const labels = ["Too weak", "Weak", "Fair", "Strong", "Excellent"];

  const onSubmit = async (v: Form) => {
    const { error } = await supabase.auth.signUp({
      email: v.email,
      password: v.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { username: v.username },
      },
    });
    if (error) {
      if (error.message.toLowerCase().includes("registered") || error.message.toLowerCase().includes("exists")) {
        toast.error("An account with this email already exists.");
      } else toast.error(error.message);
      return;
    }
    setDone(true);
    toast.success("Account created! Redirecting…");
    setTimeout(() => navigate({ to: "/dashboard" }), 1200);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AuthBackground />
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-card-strong w-full max-w-md rounded-3xl p-8"
        >
          <Logo />
          <h2 className="mt-6 font-display text-2xl font-bold">Create your account</h2>
          <p className="mt-1 text-sm text-muted-foreground">Start solving in less than a minute.</p>

          {done ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 flex flex-col items-center gap-3">
              <CheckCircle2 className="size-14 text-success animate-pulse-glow rounded-full" />
              <p className="font-medium">Welcome to Codiarc!</p>
              <p className="text-sm text-muted-foreground">Redirecting to your dashboard…</p>
            </motion.div>
          ) : (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <Field icon={User} placeholder="Username" {...register("username")} error={errors.username?.message} />
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
                {pw.length > 0 && (
                  <div>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-all"
                          style={{
                            background:
                              i < score
                                ? score < 2 ? "var(--destructive)" : score < 3 ? "var(--warning)" : "var(--success)"
                                : "var(--border)",
                          }}
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{labels[score]}</p>
                  </div>
                )}
                <Field icon={Lock} type={showPw ? "text" : "password"} placeholder="Confirm password" {...register("confirm")} error={errors.confirm?.message} />

                <label className="flex items-start gap-2 text-sm text-muted-foreground">
                  <input type="checkbox" {...register("terms")} className="mt-1 accent-primary" />
                  <span>I accept the <a className="text-primary hover:underline" href="#">Terms</a> and <a className="text-primary hover:underline" href="#">Privacy Policy</a></span>
                </label>
                {errors.terms && <p className="-mt-2 text-xs text-destructive">{errors.terms.message as string}</p>}

                <button type="submit" disabled={isSubmitting} className="btn-glow w-full rounded-xl py-3 font-semibold disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="mx-auto size-5 animate-spin" /> : "Create account"}
                </button>
              </form>

              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> OR SIGN UP WITH <div className="h-px flex-1 bg-border" />
              </div>
              <SocialButtons onAfterAuth={() => navigate({ to: "/dashboard" })} />

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
              </p>
            </>
          )}
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
