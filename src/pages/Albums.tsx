import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, LogIn, Users, Crown, Copy, Check, Trash2, LogOut } from "lucide-react";
import { useAlbumsCtx } from "@/contexts/AlbumsContext";
import { useAuth } from "@/contexts/AuthContext";

export default function AlbumsPage() {
  const { user } = useAuth();
  const { albums, loading, currentId, setCurrentId, createAlbum, joinAlbum, leaveAlbum, deleteAlbum } =
    useAlbumsCtx();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Meus Álbuns — Copa 2026";
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      await createAlbum(name.trim());
      setName("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  async function onJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      await joinAlbum(code);
      setCode("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Código inválido");
    } finally {
      setBusy(false);
    }
  }

  function copyCode(c: string) {
    navigator.clipboard.writeText(c);
    setCopied(c);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
        <h1 className="text-2xl font-black sm:text-3xl">Meus Álbuns</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Crie um álbum próprio ou entre em um álbum compartilhado usando o código de convite.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <form
          onSubmit={onCreate}
          className="space-y-3 rounded-2xl border border-border/60 bg-card/40 p-5"
        >
          <div className="flex items-center gap-2 text-sm font-bold">
            <Plus className="h-4 w-4 text-primary" /> Criar novo álbum
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do álbum (ex: Família Silva)"
            className="w-full rounded-xl border border-border bg-background/40 px-4 py-2.5 text-sm outline-none focus:border-primary/60"
            maxLength={60}
          />
          <button
            disabled={busy || !name.trim()}
            className="w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            Criar álbum
          </button>
        </form>

        <form
          onSubmit={onJoin}
          className="space-y-3 rounded-2xl border border-border/60 bg-card/40 p-5"
        >
          <div className="flex items-center gap-2 text-sm font-bold">
            <LogIn className="h-4 w-4 text-accent" /> Entrar com código
          </div>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            className="w-full rounded-xl border border-border bg-background/40 px-4 py-2.5 text-center text-base font-bold uppercase tracking-[0.3em] outline-none focus:border-accent/60"
            maxLength={8}
          />
          <button
            disabled={busy || !code.trim()}
            className="w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-accent-foreground transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            Entrar no álbum
          </button>
        </form>
      </div>

      {err && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {err}
        </div>
      )}

      <section>
        <h2 className="mb-3 px-1 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          {loading ? "Carregando…" : `${albums.length} álbum(ns)`}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {albums.map((a) => {
            const isOwner = a.owner_id === user?.id;
            const isCurrent = a.id === currentId;
            return (
              <div
                key={a.id}
                className={`rounded-2xl border p-4 transition-all ${
                  isCurrent
                    ? "border-primary/60 bg-card shadow-glow"
                    : "border-border/60 bg-card/40 hover:border-primary/40"
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      {isOwner && <Crown className="h-3.5 w-3.5 text-accent" />}
                      <h3 className="truncate font-bold">{a.name}</h3>
                    </div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {isOwner ? "Você é o dono" : "Membro"}
                    </p>
                  </div>
                  <button
                    onClick={() => copyCode(a.invite_code)}
                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-bold tracking-widest hover:border-primary/60"
                    title="Copiar código de convite"
                  >
                    {copied === a.invite_code ? (
                      <Check className="h-3 w-3 text-success" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    {a.invite_code}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCurrentId(a.id)}
                    disabled={isCurrent}
                    className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                  >
                    {isCurrent ? "Selecionado" : "Selecionar"}
                  </button>
                  {isCurrent && (
                    <Link
                      to="/"
                      className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold hover:border-primary/60"
                    >
                      Abrir álbum
                    </Link>
                  )}
                  <AlbumMembers albumId={a.id} />
                  {isOwner ? (
                    <button
                      onClick={() => {
                        if (confirm(`Apagar "${a.name}"? Esta ação não pode ser desfeita.`))
                          deleteAlbum(a.id);
                      }}
                      className="ml-auto flex items-center gap-1 rounded-full border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" /> Apagar
                    </button>
                  ) : (
                    <button
                      onClick={() => leaveAlbum(a.id)}
                      className="ml-auto flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      <LogOut className="h-3 w-3" /> Sair
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function AlbumMembers({ albumId }: { albumId: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    import("@/integrations/supabase/client").then(({ supabase }) => {
      supabase
        .from("album_members")
        .select("user_id", { count: "exact", head: true })
        .eq("album_id", albumId)
        .then(({ count }) => {
          if (alive) setCount(count ?? 0);
        });
    });
    return () => {
      alive = false;
    };
  }, [albumId]);

  return (
    <span className="flex items-center gap-1 rounded-full bg-muted/60 px-3 py-1.5 text-xs text-muted-foreground">
      <Users className="h-3 w-3" />
      {count ?? "…"}
    </span>
  );
}
