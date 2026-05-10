import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TEAMS, TOTAL_STICKERS, stickerIds } from "@/data/teams";

export type AlbumState = Record<string, number>;

export function useAlbum(albumId: string | null) {
  const [state, setState] = useState<AlbumState>({});
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!albumId) {
      setState({});
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("album_stickers")
      .select("sticker_id, count")
      .eq("album_id", albumId);
    const map: AlbumState = {};
    for (const row of data ?? []) {
      if (row.count > 0) map[row.sticker_id] = row.count;
    }
    setState(map);
    setLoading(false);
  }, [albumId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const persist = useCallback(
    async (id: string, count: number) => {
      if (!albumId) return;
      const { data: u } = await supabase.auth.getUser();
      if (count <= 0) {
        await supabase
          .from("album_stickers")
          .delete()
          .eq("album_id", albumId)
          .eq("sticker_id", id);
      } else {
        await supabase.from("album_stickers").upsert(
          {
            album_id: albumId,
            sticker_id: id,
            count,
            updated_at: new Date().toISOString(),
            updated_by: u.user?.id ?? null,
          },
          { onConflict: "album_id,sticker_id" },
        );
      }
    },
    [albumId],
  );

  const setCount = useCallback(
    (id: string, n: number) => {
      setState((s) => {
        const next = { ...s };
        if (n <= 0) delete next[id];
        else next[id] = n;
        return next;
      });
      persist(id, Math.max(0, n));
    },
    [persist],
  );

  const getCount = useCallback((id: string) => state[id] ?? 0, [state]);

  const toggleOwn = useCallback(
    (id: string) => {
      const cur = state[id] ?? 0;
      if (cur === 0) setCount(id, 1);
      else if (cur === 1) setCount(id, 0);
    },
    [state, setCount],
  );

  const addRepeat = useCallback(
    (id: string) => setCount(id, (state[id] ?? 0) + 1),
    [state, setCount],
  );
  const removeRepeat = useCallback(
    (id: string) => {
      const cur = state[id] ?? 0;
      if (cur > 1) setCount(id, cur - 1);
    },
    [state, setCount],
  );

  let owned = 0;
  let repeats = 0;
  for (const team of TEAMS) {
    for (const id of stickerIds(team)) {
      const c = state[id] ?? 0;
      if (c >= 1) owned += 1;
      if (c > 1) repeats += c - 1;
    }
  }
  const missing = TOTAL_STICKERS - owned;

  return {
    state,
    loading,
    getCount,
    toggleOwn,
    addRepeat,
    removeRepeat,
    setCount,
    reload,
    stats: { owned, missing, repeats, total: TOTAL_STICKERS },
  };
}

export function teamProgress(state: AlbumState, code: string) {
  const team = TEAMS.find((t) => t.code === code);
  if (!team) return { owned: 0, total: 0, repeats: 0 };
  let owned = 0;
  let repeats = 0;
  for (const id of stickerIds(team)) {
    const c = state[id] ?? 0;
    if (c >= 1) owned += 1;
    if (c > 1) repeats += c - 1;
  }
  return { owned, total: team.total, repeats };
}
