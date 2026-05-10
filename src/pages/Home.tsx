import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TEAMS } from "@/data/teams";
import { useAlbum, teamProgress } from "@/hooks/useAlbum";
import { TeamCard } from "@/components/TeamCard";
import { ProgressBar } from "@/components/ProgressBar";
import { useAlbumsCtx } from "@/contexts/AlbumsContext";
import { Link } from "react-router-dom";

export default function HomePage() {
  const { current } = useAlbumsCtx();
  const { state, loading, stats } = useAlbum(current?.id ?? null);
  const hydrated = !loading;
  const [q, setQ] = useState("");

  useEffect(() => {
    document.title = "Álbum Copa do Mundo 2026 — Controle de Figurinhas";
  }, []);

  const filtered = useMemo(
    () =>
      TEAMS.filter(
        (t) =>
          t.name.toLowerCase().includes(q.toLowerCase()) ||
          t.code.toLowerCase().includes(q.toLowerCase()),
      ),
    [q],
  );

  const grouped = useMemo(() => {
    const m = new Map<string, typeof TEAMS>();
    for (const t of filtered) {
      if (!m.has(t.group)) m.set(t.group, []);
      m.get(t.group)!.push(t);
    }
    return Array.from(m.entries());
  }, [filtered]);

  if (!current) {
    return (
      <div className="rounded-3xl border border-dashed border-border/60 bg-card/30 px-6 py-16 text-center">
        <p className="text-base font-semibold">Você ainda não tem um álbum</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Crie um álbum próprio ou entre em um álbum compartilhado para começar.
        </p>
        <Link
          to="/albums"
          className="mt-5 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow"
        >
          Ir para Álbuns
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">
          Álbum oficial · 2026
        </p>
        <h1 className="mt-1 text-3xl font-black leading-tight sm:text-4xl">
          Sua coleção da{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Copa do Mundo
          </span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Acompanhe quais figurinhas você tem, quais faltam e suas repetidas para troca.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
          <Stat label="Tenho" value={hydrated ? stats.owned : 0} accent="primary" />
          <Stat label="Faltam" value={hydrated ? stats.missing : 0} accent="muted" />
          <Stat label="Repetidas" value={hydrated ? stats.repeats : 0} accent="destructive" />
        </div>

        <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
          <span>Progresso geral</span>
          <span className="tabular-nums">
            {hydrated ? Math.round((stats.owned / stats.total) * 100) : 0}% ·{" "}
            {hydrated ? stats.owned : 0}/{stats.total}
          </span>
        </div>
        <div className="mt-2">
          <ProgressBar value={hydrated ? stats.owned : 0} max={stats.total} />
        </div>
      </section>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar seleção ou código (ex: BRA, Argentina)…"
          className="w-full rounded-full border border-border bg-card/60 py-3 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary/60 focus:shadow-glow"
        />
      </div>

      {grouped.map(([group, teams]) => (
        <section key={group}>
          <h2 className="mb-3 flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex h-6 min-w-6 items-center justify-center rounded-md bg-primary/15 px-1.5 text-primary">
              {group}
            </span>
            {group === "Especial" ? "Especiais" : `Grupo ${group}`}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => {
              const p = teamProgress(state, team.code);
              return (
                <TeamCard key={team.code} team={team} owned={p.owned} repeats={p.repeats} />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "primary" | "muted" | "destructive";
}) {
  const color =
    accent === "primary"
      ? "text-primary"
      : accent === "destructive"
        ? "text-destructive"
        : "text-foreground";
  return (
    <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-black tabular-nums sm:text-3xl ${color}`}>{value}</p>
    </div>
  );
}
