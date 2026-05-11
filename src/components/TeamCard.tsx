import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { Team } from "@/data/teams";
import { ProgressBar } from "./ProgressBar";

type Props = {
  team: Team;
  owned: number;
  repeats: number;
};

export function TeamCard({ team, owned, repeats }: Props) {
  const complete = owned === team.total;

  const FLAG_URL =
  "https://ssnasqktjrrpfjascmgd.supabase.co/storage/v1/object/public/flags/";
  return (
    <Link
      to={`/team/${team.code}`}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-glow"
    >
      {complete && (
        <div className="absolute right-3 top-3 rounded-full bg-success/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">
          completo
        </div>
      )}
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-4xl shadow-inner">
            {team.flag.endsWith(".png") ? (
  <img
    src={`${FLAG_URL}${team.flag}`}
    alt={team.name}
    className="h-8 w-8 rounded-full object-cover"
  />
) : (
  <span>{team.flag}</span>
)}
          </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{team.name}</p>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {team.code} · Grupo {team.group}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
      </div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold tabular-nums">
          {owned}
          <span className="text-muted-foreground">/{team.total}</span>
        </span>
        {repeats > 0 && (
          <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold text-destructive">
            +{repeats} rep.
          </span>
        )}
      </div>
      <ProgressBar value={owned} max={team.total} />
    </Link>
  );
}
