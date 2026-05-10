import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Repeat2, Trophy, Library, LogOut, ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAlbumsCtx } from "@/contexts/AlbumsContext";

export function AppShell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const nav = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { albums, current, setCurrentId } = useAlbumsCtx();
  const [open, setOpen] = useState(false);

  const tabs = [
    { to: "/", label: "Álbum", icon: Home },
    { to: "/repetidas", label: "Repetidas", icon: Repeat2 },
    { to: "/albums", label: "Álbuns", icon: Library },
  ];

  const isActive = (to: string) =>
    to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow">
              <Trophy className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Copa do Mundo
              </p>
              <p className="text-sm font-bold">Álbum 2026</p>
            </div>
          </Link>

          {user && albums.length > 0 && (
            <div className="relative min-w-0 flex-1 sm:max-w-xs">
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-left text-xs"
              >
                <span className="truncate font-bold">{current?.name ?? "Selecione…"}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </button>
              {open && (
                <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-72 overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-2xl">
                  {albums.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        setCurrentId(a.id);
                        setOpen(false);
                      }}
                      className={`block w-full truncate rounded-lg px-3 py-2 text-left text-xs hover:bg-muted ${a.id === current?.id ? "bg-muted font-bold" : ""}`}
                    >
                      {a.name}
                    </button>
                  ))}
                  <Link
                    to="/albums"
                    onClick={() => setOpen(false)}
                    className="mt-1 block rounded-lg border-t border-border px-3 py-2 text-center text-xs font-semibold text-primary"
                  >
                    Gerenciar álbuns
                  </Link>
                </div>
              )}
            </div>
          )}

          <nav className="hidden gap-1 rounded-full border border-border bg-card/60 p-1 sm:flex">
            {tabs.map((t) => {
              const active = isActive(t.to);
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
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

          {user && (
            <button
              onClick={async () => {
                await signOut();
                nav("/login");
              }}
              className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card/60 p-1 pr-3 text-xs"
              title="Sair"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {(profile?.display_name ?? user.email ?? "?")[0]?.toUpperCase()}
                </span>
              )}
              <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
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
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                active ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground"
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
