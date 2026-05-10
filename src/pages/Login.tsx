import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy } from "lucide-react";

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Entrar — Álbum Copa do Mundo 2026";
  }, []);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  async function onGoogle() {
    setBusy(true);
    setErr(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Falha ao entrar");
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card/60 p-8 backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-glow">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent">
              Copa 2026
            </p>
            <h1 className="text-2xl font-black">Álbum Compartilhado</h1>
          </div>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">
          Entre com sua conta Google para criar e compartilhar álbuns com seus amigos.
        </p>
        <button
          onClick={onGoogle}
          disabled={busy}
          className="flex w-full items-center justify-center gap-3 rounded-full bg-foreground py-3 text-sm font-semibold text-background transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          <GoogleIcon />
          {busy ? "Conectando…" : "Continuar com Google"}
        </button>
        {err && <p className="mt-4 text-xs text-destructive">{err}</p>}
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 11.9S6.8 21.3 12 21.3c6.9 0 9.5-4.8 9.5-7.3 0-.5 0-.9-.1-1.3H12z"
      />
    </svg>
  );
}
