import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ListTodo, Share2, Check, PartyPopper } from "lucide-react";
import { TEAMS, stickerIds } from "@/data/teams";
import { useAlbum } from "@/hooks/useAlbum";
import { useAlbumsCtx } from "@/contexts/AlbumsContext";

const FLAG_URL = "https://ssnasqktjrrpfjascmgd.supabase.co/storage/v1/object/public/flags/";

export default function MissingPage() {
  const { current } = useAlbumsCtx();
  const { state, toggleOwn } = useAlbum(current?.id ?? null);
  const [q, setQ] = useState("");
  const [filterCode, setFilterCode] = useState<string>("ALL");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Faltando para completar — Álbum Copa do Mundo 2026";
  }, []);

  const data = useMemo(() => {
    const groups: Array<{ team: (typeof TEAMS)[number]; items: string[] }> = [];
    for (const team of TEAMS) {
      if (filterCode !== "ALL" && filterCode !== team.code) continue;
      const items: string[] = [];
      for (const id of stickerIds(team)) {
        const c = state[id] ?? 0;
        if (c === 0 && id.toLowerCase().includes(q.toLowerCase())) {
          items.push(id);
        }
      }
      if (items.length) groups.push({ team, items });
    }
    return groups;
  }, [state, q, filterCode]);

  const totalMissing = data.reduce((s, g) => s + g.items.length, 0);

  async function handleShare() {
    const lines: string[] = [];
    lines.push("📋 Figurinhas que me faltam — Copa 2026");
    lines.push("");

    for (const group of data) {
      lines.push(` ${group.team.name}`);
      for (const id of group.items) {
        lines.push(`• ${id}`);
      }
      lines.push("");
    }

    lines.push(`Total de faltantes: ${totalMissing}`);

    const text = lines.join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/20 text-accent">
            <ListTodo className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black sm:text-3xl">Faltando para completar</h1>
            <p className="text-xs text-muted-foreground">
              <span className="font-bold text-accent tabular-nums">{totalMissing}</span> figurinhas
              para o álbum ficar completo
            </p>
          </div>
          <button
            onClick={handleShare}
            disabled={totalMissing === 0}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2 text-xs font-semibold transition-all hover:scale-105 hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copiado!
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                Compartilhar
              </>
            )}
          </button>
        </div>
      </section>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar figurinha (ex: BRA10)…"
            className="w-full rounded-full border border-border bg-card/60 py-3 pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:shadow-glow"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterChip active={filterCode === "ALL"} onClick={() => setFilterCode("ALL")}>
            Todas
          </FilterChip>
          {TEAMS.map((t) => (
            <FilterChip
              key={t.code}
              active={filterCode === t.code}
              onClick={() => setFilterCode(t.code)}
            >
              {t.flag.endsWith(".png") ? (
                <img
                  src={`${FLAG_URL}${t.flag}`}
                  alt={t.name}
                  className="h-6 w-6 rounded-full object-cover mb-1"
                />
              ) : (
                <span>{t.flag}</span>
              )}
              {t.code}
            </FilterChip>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/60 bg-card/30 px-6 py-16 text-center">
          <PartyPopper className="mx-auto h-8 w-8 text-accent" />
          <p className="mt-3 text-base font-semibold">
            {totalMissing === 0 && q === "" && filterCode === "ALL"
              ? "Álbum completo! 🎉"
              : "Nenhuma figurinha por aqui ✨"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalMissing === 0 && q === "" && filterCode === "ALL"
              ? "Você já tem todas as figurinhas do álbum."
              : "Ajuste a busca ou o filtro para ver outras seleções."}
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:scale-105"
          >
            Ir para o álbum
          </Link>
        </div>
      ) : (
        data.map(({ team, items }) => (
          <section key={team.code} className="rounded-2xl border border-border/60 bg-card/60 p-4">
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
              <Link to={`/team/${team.code}`} className="flex-1 font-bold hover:text-primary">
                {team.name}
              </Link>
              <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-bold text-accent">
                {items.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {items.map((id) => (
                <div
                  key={id}
                  className="flex items-center gap-2 rounded-full border border-border bg-background/40 py-1 pl-3 pr-1"
                >
                  <span className="text-xs font-bold tabular-nums">{id}</span>
                  <button
                    onClick={() => toggleOwn(id)}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground hover:scale-110"
                    aria-label={`Marcar ${id} como conseguida`}
                    title="Marquei essa!"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
        active
          ? "border-primary bg-primary text-primary-foreground shadow-glow"
          : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
