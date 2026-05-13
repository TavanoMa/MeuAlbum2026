import { useMemo, useState } from "react";
import {
  Handshake,
  Plus,
  Search,
  Copy,
  Check,
  ArrowRightLeft,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAlbum } from "@/hooks/useAlbum";
import { useAlbumsCtx } from "@/contexts/AlbumsContext";
import { TEAMS, stickerIds } from "@/data/teams";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 })
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join("");
}

type MatchItem = {
  id: string;
  type: "give" | "receive";
};

export default function TradesPage() {
  const { current } = useAlbumsCtx();
  const { state } = useAlbum(current?.id ?? null);

  const [loading, setLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [createdCode, setCreatedCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [tradeId, setTradeId] = useState<string | null>(null);
  const [finalized, setFinalized] = useState(false);

  // Figurinhas que o usuário confirma que DEU e RECEBEU
  const [selectedGive, setSelectedGive] = useState<Set<string>>(new Set());
  const [selectedReceive, setSelectedReceive] = useState<Set<string>>(new Set());

  const repeated = useMemo(() => {
    const arr: string[] = [];
    for (const team of TEAMS) {
      for (const id of stickerIds(team)) {
        const count = state[id] ?? 0;
        if (count > 1) arr.push(`${id} (+${count - 1})`);
      }
    }
    return arr;
  }, [state]);

  function toggleGive(id: string) {
    setSelectedGive((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleReceive(id: string) {
    setSelectedReceive((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function createTrade() {
    try {
      setLoading(true);
      setMessage("");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setMessage("Você precisa estar logado."); return; }
      if (!current?.id) { setMessage("Nenhum álbum ativo."); return; }

      const code = generateCode();

      const { data, error } = await supabase
        .from("trades")
        .insert({ code, created_by: user.id, album_id: current.id })
        .select()
        .single();

      if (error) throw error;

      const { error: memberError } = await supabase
        .from("trade_members")
        .insert({ trade_id: data.id, user_id: user.id, album_id: current.id });

      if (memberError) throw memberError;

      setCreatedCode(code);
      setJoinCode(code);
      setMessage("Sessão criada! Compartilhe o código e clique em 'Entrar' para ver as trocas.");
    } catch (err) {
      console.error(err);
      setMessage("Erro ao criar troca.");
    } finally {
      setLoading(false);
    }
  }

  async function joinTrade() {
    try {
      setLoading(true);
      setMessage("");
      setMatches([]);
      setSelectedGive(new Set());
      setSelectedReceive(new Set());
      setFinalized(false);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !current?.id) {
        setMessage("Você precisa estar logado e com um álbum selecionado.");
        return;
      }

      const { data: trade, error: tradeError } = await supabase
        .from("trades")
        .select("*")
        .eq("code", joinCode.toUpperCase())
        .single();

      if (tradeError || !trade) { setMessage("Código inválido."); return; }

      const { data: existing, error: existingError } = await supabase
        .from("trade_members")
        .select("trade_id")
        .eq("trade_id", trade.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingError) throw existingError;

      if (!existing) {
        const { error: insertError } = await supabase
          .from("trade_members")
          .insert({ trade_id: trade.id, user_id: user.id, album_id: current.id });
        if (insertError) throw insertError;
      }

      const { data: rpcResult, error: rpcError } = await supabase
        .rpc("get_trade_matches", {
          p_trade_id: trade.id,
          p_my_album_id: current.id,
        });

      if (rpcError) throw rpcError;

      if (!rpcResult || rpcResult.length === 0) {
        const { data: members } = await supabase
          .from("trade_members")
          .select("user_id")
          .eq("trade_id", trade.id);

        const otherExists = members?.some((m) => m.user_id !== user.id);
        setMessage(otherExists
          ? "Conectado! Nenhuma troca possível entre os álbuns."
          : "Aguardando o outro colega entrar na sala...");
        return;
      }

      const result: MatchItem[] = rpcResult.map((row: { sticker_id: string; match_type: string }) => ({
        id: row.sticker_id,
        type: row.match_type as "give" | "receive",
      }));

      setTradeId(trade.id);
      setMatches(result);
      setMessage("Selecione as figurinhas que você deu e recebeu, depois finalize.");
    } catch (err) {
      console.error(err);
      setMessage("Erro ao processar a troca.");
    } finally {
      setLoading(false);
    }
  }

  async function finalizeTrade() {
  if (!current?.id || !tradeId) return;

  try {
    setFinalizing(true);
    setMessage("");

    // Figurinhas que DEU: diminui 1
    for (const id of selectedGive) {
      const currentCount = state[id] ?? 0;
      const newCount = Math.max(0, currentCount - 1);
      const { error } = await supabase
        .from("album_stickers")
        .update({ count: newCount })
        .eq("album_id", current.id)
        .eq("sticker_id", id);
      if (error) throw error;
    }

    // Figurinhas que RECEBEU: aumenta 1
    for (const id of selectedReceive) {
      const currentCount = state[id] ?? 0;
      const { error } = await supabase
        .from("album_stickers")
        .upsert(
          { album_id: current.id, sticker_id: id, count: currentCount + 1 },
          { onConflict: "album_id,sticker_id" }
        );
      if (error) throw error;
    }

    // Marca a trade como inativa
    await supabase
      .from("trades")
      .update({ active: false })
      .eq("id", tradeId);

    setFinalized(true);
    setMatches([]);
    setSelectedGive(new Set());
    setSelectedReceive(new Set());
    setMessage(`Troca finalizada! ${selectedGive.size} figurinha(s) dada(s) e ${selectedReceive.size} recebida(s).`);
  } catch (err) {
    console.error(err);
    setMessage("Erro ao finalizar a troca.");
  } finally {
    setFinalizing(false);
  }
}

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(createdCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err: any) {
      console.error(err);
    }
  }

  const give = matches.filter((m) => m.type === "give");
  const receive = matches.filter((m) => m.type === "receive");
  const canFinalize = selectedGive.size > 0 || selectedReceive.size > 0;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Handshake className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black">Trocas</h1>
            <p className="text-sm text-muted-foreground">
              Compare automaticamente as figurinhas repetidas.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border border-border/60 bg-card/60 p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-black">Criar troca</h2>
              <p className="text-xs text-muted-foreground">Gere um código para compartilhar.</p>
            </div>
          </div>

          <button
            onClick={createTrade}
            disabled={loading}
            className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground"
          >
            {loading ? "Criando..." : "Criar sessão"}
          </button>

          {createdCode && (
            <div className="mt-5 rounded-2xl border border-primary/30 bg-primary/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Código da troca
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-3xl font-black tracking-[0.2em]">{createdCode}</span>
                <button
                  onClick={copyCode}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-background/70"
                >
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-border/60 bg-card/60 p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-black">Entrar em troca</h2>
              <p className="text-xs text-muted-foreground">Digite o código recebido.</p>
            </div>
          </div>

          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            className="mb-3 w-full rounded-2xl border border-border bg-background/50 px-4 py-3 text-center text-lg font-black uppercase tracking-[0.2em] outline-none"
          />

          <button
            onClick={joinTrade}
            disabled={loading || !joinCode}
            className="w-full rounded-2xl bg-accent py-3 text-sm font-bold text-accent-foreground"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </section>
      </div>

      {(give.length > 0 || receive.length > 0) && (
        <section className="rounded-3xl border border-border/60 bg-card/60 p-5">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black">Possíveis trocas</h2>
              <p className="text-sm text-muted-foreground">
                Toque nas figurinhas que você efetivamente deu ou recebeu.
              </p>
            </div>
          </div>

          <p className="mb-4 text-xs text-muted-foreground">
            Selecionadas: {selectedGive.size} para dar · {selectedReceive.size} para receber
          </p>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* DAR */}
            <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4">
              <h3 className="mb-1 font-black text-green-500">
                Você pode oferecer ({give.length})
              </h3>
              <p className="mb-3 text-xs text-muted-foreground">
                Toque nas que você realmente deu.
              </p>
              <div className="flex flex-wrap gap-2">
                {give.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma figurinha encontrada.</p>
                ) : (
                  give.map((item) => {
                    const selected = selectedGive.has(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleGive(item.id)}
                        className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                          selected
                            ? "bg-green-500 text-white ring-2 ring-green-500 ring-offset-1"
                            : "bg-green-500/15 text-green-500 hover:bg-green-500/30"
                        }`}
                      >
                        {selected && "✓ "}{item.id}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* RECEBER */}
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
              <h3 className="mb-1 font-black text-blue-500">
                Você procura ({receive.length})
              </h3>
              <p className="mb-3 text-xs text-muted-foreground">
                Toque nas que você realmente recebeu.
              </p>
              <div className="flex flex-wrap gap-2">
                {receive.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma figurinha encontrada.</p>
                ) : (
                  receive.map((item) => {
                    const selected = selectedReceive.has(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleReceive(item.id)}
                        className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                          selected
                            ? "bg-blue-500 text-white ring-2 ring-blue-500 ring-offset-1"
                            : "bg-blue-500/15 text-blue-500 hover:bg-blue-500/30"
                        }`}
                      >
                        {selected && "✓ "}{item.id}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Botão finalizar */}
          <div className="mt-5 border-t border-border/40 pt-5">
            <button
              onClick={finalizeTrade}
              disabled={!canFinalize || finalizing}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-all ${
                canFinalize
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "cursor-not-allowed bg-muted text-muted-foreground"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              {finalizing
                ? "Finalizando..."
                : canFinalize
                  ? `Finalizar troca (${selectedGive.size} dadas · ${selectedReceive.size} recebidas)`
                  : "Selecione as figurinhas para finalizar"}
            </button>
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-border/60 bg-card/60 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black">Suas repetidas</h2>
            <p className="text-sm text-muted-foreground">Essas figurinhas podem aparecer em trocas.</p>
          </div>
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
            {repeated.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {repeated.map((item) => (
            <div key={item} className="rounded-full border border-border bg-background/40 px-3 py-1.5 text-xs font-bold">
              {item}
            </div>
          ))}
        </div>
      </section>

      {message && (
        <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
          finalized
            ? "border-green-500/30 bg-green-500/10 text-green-600"
            : "border-border/60 bg-card/60"
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}