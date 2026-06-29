import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Github, Linkedin, MapPin, Building2, Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useMyProfile, useSubmissions, useProblems } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Codiarc" }] }),
  component: ProfilePage,
});

type FormData = {
  username: string;
  bio: string;
  country: string;
  institution: string;
  github: string;
  linkedin: string;
  skills: string;
  avatar_url: string;
};

function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useMyProfile(user?.id);
  const { data: submissions } = useSubmissions(user?.id);
  const { data: problems } = useProblems();
  const qc = useQueryClient();

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>();

  useEffect(() => {
    if (profile) {
      reset({
        username: profile.username ?? "",
        bio: profile.bio ?? "",
        country: profile.country ?? "",
        institution: profile.institution ?? "",
        github: profile.github ?? "",
        linkedin: profile.linkedin ?? "",
        skills: (profile.skills ?? []).join(", "),
        avatar_url: profile.avatar_url ?? "",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (v: FormData) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        username: v.username,
        bio: v.bio,
        country: v.country,
        institution: v.institution,
        github: v.github,
        linkedin: v.linkedin,
        avatar_url: v.avatar_url,
        skills: v.skills.split(",").map((s) => s.trim()).filter(Boolean),
      })
      .eq("id", user.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["profile"] });
    }
  };

  if (isLoading || !profile) {
    return <div className="grid h-[60vh] place-items-center text-muted-foreground"><Loader2 className="size-6 animate-spin" /></div>;
  }

  const solved = new Set((submissions ?? []).filter((s) => s.status === "accepted").map((s) => s.problem_id));
  const total = problems?.length ?? 0;
  const initials = (profile.username ?? "U").slice(0, 2).toUpperCase();

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* hero */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card relative overflow-hidden rounded-2xl p-6 lg:col-span-1">
        <div className="absolute inset-x-0 top-0 h-24" style={{ background: "var(--gradient-primary)", opacity: 0.4 }} />
        <div className="relative">
          <div className="grid size-24 place-items-center rounded-2xl border-4 border-background text-2xl font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
            {initials}
          </div>
          <h2 className="mt-4 font-display text-xl font-bold">@{profile.username}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <p className="mt-3 text-sm">{profile.bio || "No bio yet."}</p>
          <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
            {profile.country && <div className="flex items-center gap-2"><MapPin className="size-3.5" /> {profile.country}</div>}
            {profile.institution && <div className="flex items-center gap-2"><Building2 className="size-3.5" /> {profile.institution}</div>}
            {profile.github && <a href={`https://github.com/${profile.github}`} target="_blank" className="flex items-center gap-2 hover:text-foreground"><Github className="size-3.5" /> {profile.github}</a>}
            {profile.linkedin && <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" className="flex items-center gap-2 hover:text-foreground"><Linkedin className="size-3.5" /> {profile.linkedin}</a>}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            <Stat label="Solved" value={`${solved.size}/${total}`} />
            <Stat label="Rating" value={profile.rating} />
            <Stat label="Streak" value={profile.streak} />
          </div>
        </div>
      </motion.div>

      {/* edit form */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6 lg:col-span-2">
        <h3 className="font-display text-xl font-bold">Edit Profile</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Input label="Username" {...register("username", { required: true })} />
          <Input label="Avatar URL" placeholder="https://…" {...register("avatar_url")} />
          <div className="sm:col-span-2">
            <label className="text-xs font-medium uppercase text-muted-foreground">Bio</label>
            <textarea {...register("bio")} rows={3} className="mt-1 w-full rounded-xl border border-border bg-glass p-3 text-sm outline-none focus:border-primary" />
          </div>
          <Input label="Country" {...register("country")} />
          <Input label="Institution" {...register("institution")} />
          <Input label="GitHub username" placeholder="octocat" {...register("github")} />
          <Input label="LinkedIn handle" placeholder="janedoe" {...register("linkedin")} />
          <div className="sm:col-span-2">
            <Input label="Skills (comma separated)" placeholder="Python, Algorithms, System Design" {...register("skills")} />
          </div>
          <div className="sm:col-span-2">
            <button disabled={isSubmitting} className="btn-glow inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-medium disabled:opacity-50">
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

const Input = ({ label, ...props }: any) => (
  <div>
    <label className="text-xs font-medium uppercase text-muted-foreground">{label}</label>
    <input {...props} className="mt-1 w-full rounded-xl border border-border bg-glass p-3 text-sm outline-none focus:border-primary" />
  </div>
);

const Stat = ({ label, value }: { label: string; value: any }) => (
  <div className="rounded-xl bg-glass p-3">
    <div className="font-display text-lg font-bold text-gradient">{value}</div>
    <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
  </div>
);
