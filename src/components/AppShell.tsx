import { Link, useLocation } from "react-router-dom";
import { Home, Repeat2, Trophy } from "lucide-react";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const tabs = [
    { to: "/", label: "Álbum", icon: Home },
    { to: "/repetidas", label: "Repetidas", icon: Repeat2 },
  ];

  const isActive = (to: string) =>
    to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow">
              <Trophy className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Copa do Mundo
              </p>
              <p className="text-sm font-bold">Álbum 2026</p>
            </div>
          </Link>
          <nav className="hidden gap-1 rounded-full border border-border bg-card/60 p-1 sm:flex">
            {tabs.map((t) => {
              const active = isActive(t.to);
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:pb-10">{children}</main>

      <nav className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-1 rounded-full border border-border bg-card/90 p-1 shadow-2xl backdrop-blur-xl sm:hidden">
        {tabs.map((t) => {
          const active = isActive(t.to);
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all ${
                active
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
