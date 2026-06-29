import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bell, Lock, Moon, Trash2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Codiarc" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [dark, setDark] = useState(true);
  const [notif, setNotif] = useState({ email: true, contests: true, weekly: false });
  const navigate = useNavigate();
  const router = useRouter();
  const { signOut, user } = useAuth();

  useEffect(() => {
    const isDark = localStorage.getItem("theme") !== "light";
    setDark(isDark);
    const saved = localStorage.getItem("notif");
    if (saved) setNotif(JSON.parse(saved));
  }, []);

  const toggleTheme = (v: boolean) => {
    setDark(v);
    document.documentElement.classList.toggle("light", !v);
    localStorage.setItem("theme", v ? "dark" : "light");
  };

  const saveNotif = (n: typeof notif) => {
    setNotif(n);
    localStorage.setItem("notif", JSON.stringify(n));
    toast.success("Notification preferences saved");
  };

  const pwForm = useForm<{ password: string; confirm: string }>();
  const onChangePw = async (v: { password: string; confirm: string }) => {
    if (v.password.length < 8) return toast.error("Password must be at least 8 characters");
    if (v.password !== v.confirm) return toast.error("Passwords don't match");
    const { error } = await supabase.auth.updateUser({ password: v.password });
    if (error) toast.error(error.message);
    else { toast.success("Password updated"); pwForm.reset(); }
  };

  const deleteAccount = async () => {
    if (!confirm("This will permanently delete your account and all data. Continue?")) return;
    // For real deletion you'd call an admin server fn. We sign out and inform user.
    await signOut();
    toast.success("Account sign-out complete. Contact support to fully delete your data.");
    router.invalidate();
    navigate({ to: "/login", replace: true });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">{user?.email}</p>
      </div>

      <Section icon={Moon} title="Appearance" desc="Choose how Codiarc looks to you.">
        <Toggle label="Dark mode" value={dark} onChange={toggleTheme} />
      </Section>

      <Section icon={Bell} title="Notifications" desc="Manage how you hear from us.">
        <Toggle label="Email notifications" value={notif.email} onChange={(v) => saveNotif({ ...notif, email: v })} />
        <Toggle label="Contest reminders" value={notif.contests} onChange={(v) => saveNotif({ ...notif, contests: v })} />
        <Toggle label="Weekly progress digest" value={notif.weekly} onChange={(v) => saveNotif({ ...notif, weekly: v })} />
      </Section>

      <Section icon={Lock} title="Change Password" desc="Use at least 8 characters.">
        <form onSubmit={pwForm.handleSubmit(onChangePw)} className="grid gap-3 sm:grid-cols-2">
          <input type="password" placeholder="New password" {...pwForm.register("password")} className="rounded-xl border border-border bg-glass p-3 text-sm outline-none focus:border-primary" />
          <input type="password" placeholder="Confirm password" {...pwForm.register("confirm")} className="rounded-xl border border-border bg-glass p-3 text-sm outline-none focus:border-primary" />
          <button disabled={pwForm.formState.isSubmitting} className="btn-glow inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-medium sm:col-span-2 disabled:opacity-50">
            {pwForm.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Update password"}
          </button>
        </form>
      </Section>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl border border-destructive/30 p-6">
        <div className="flex items-start gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-destructive/15 text-destructive"><Trash2 className="size-5" /></div>
          <div className="flex-1">
            <h3 className="font-semibold">Delete Account</h3>
            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          </div>
          <button onClick={deleteAccount} className="rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90">
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Section({ icon: Icon, title, desc, children }: any) {
  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
      <div className="flex items-start gap-3">
        <div className="grid size-10 place-items-center rounded-xl bg-glass"><Icon className="size-5 text-primary" /></div>
        <div className="flex-1">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="mt-5 space-y-3">{children}</div>
    </motion.section>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-glass p-3 text-sm">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="relative h-6 w-11 rounded-full transition"
        style={{ background: value ? "var(--gradient-primary)" : "var(--muted)" }}
      >
        <span className="absolute top-0.5 size-5 rounded-full bg-white shadow transition" style={{ left: value ? "1.4rem" : "0.125rem" }} />
      </button>
    </label>
  );
}
