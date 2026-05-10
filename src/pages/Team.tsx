import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getTeam, stickerIds } from "@/data/teams";
import { useAlbum, teamProgress } from "@/hooks/useAlbum";
import { StickerCard } from "@/components/StickerCard";
import { ProgressBar } from "@/components/ProgressBar";

export default function TeamPage() {
  const { code = "" } = useParams();
  const team = getTeam(code);
  const { state, getCount, toggleOwn, addRepeat, removeRepeat } = useAlbum();

  useEffect(() => {
    document.title = team
      ? `${team.name} (${team.code}) — Álbum 2026`
      : "Seleção — Álbum 2026";
  }, [team]);

  if (!team) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-muted-foreground">Seleção não encontrada.</p>
        <Link to="/" className="mt-4 inline-block text-primary underline">
          Voltar
        </Link>
      </div>
    );
  }

  const ids = stickerIds(team);
  const p = teamProgress(state, team.code);

  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-4xl shadow-inner">
            <span>{team.flag}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
              {team.group === "Especial" ? "Especial" : `Grupo ${team.group}`}
            </p>
            <h1 className="truncate text-2xl font-black sm:text-3xl">{team.name}</h1>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {team.code}1 — {team.code}
              {team.total}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            <span className="font-bold text-foreground tabular-nums">{p.owned}</span>/{p.total}{" "}
            figurinhas
            {p.repeats > 0 && (
              <span className="ml-2 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold text-destructive">
                {p.repeats} repetidas
              </span>
            )}
          </span>
          <span className="tabular-nums">{Math.round((p.owned / p.total) * 100)}%</span>
        </div>
        <div className="mt-2">
          <ProgressBar value={p.owned} max={p.total} />
        </div>
      </section>

      <div className="rounded-2xl border border-border/40 bg-card/40 p-3 text-[11px] text-muted-foreground">
        <span className="font-semibold text-foreground">Dica:</span> toque para marcar “Tenho”.
        Use o <span className="font-bold text-primary">+</span> para adicionar repetidas.
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 md:grid-cols-5">
        {ids.map((id) => (
          <StickerCard
            key={id}
            id={id}
            count={getCount(id)}
            onToggle={() => toggleOwn(id)}
            onAdd={() => addRepeat(id)}
            onRemove={() => removeRepeat(id)}
          />
        ))}
      </div>
    </div>
  );
}
