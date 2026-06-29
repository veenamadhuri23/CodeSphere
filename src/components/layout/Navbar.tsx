import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { Bell, LogOut, Moon, Search, Settings, Sun, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/problems", label: "Problems" },
  { to: "/contests", label: "Contests" },
  { to: "/discuss", label: "Discuss" },
  { to: "/leaderboard", label: "Leaderboard" },
] as const;

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved !== "light";
    setDark(isDark);
    document.documentElement.classList.toggle("light", !isDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("light", !next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const initials = (user?.email ?? "U").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl">
      <div className="absolute inset-0 -z-10 bg-background/70 border-b border-border" />
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-glass hover:text-foreground"
              activeProps={{ className: "rounded-lg px-3 py-2 text-sm font-medium bg-glass text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search problems…"
              className="w-64 rounded-xl border border-border bg-glass py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={toggleTheme}
            className="grid size-9 place-items-center rounded-xl hover:bg-glass"
            aria-label="Toggle theme"
          >
            {dark ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>
          <button
            onClick={() => toast.info("No new notifications")}
            className="relative grid size-9 place-items-center rounded-xl hover:bg-glass"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-accent" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <Avatar className="size-9 border border-border">
                <AvatarFallback className="bg-gradient-to-br from-blue to-cyan text-xs font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-2 text-xs text-muted-foreground truncate">{user?.email}</div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
                <UserIcon className="mr-2 size-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
                <Settings className="mr-2 size-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await signOut();
                  router.invalidate();
                  navigate({ to: "/login", replace: true });
                }}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 size-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
