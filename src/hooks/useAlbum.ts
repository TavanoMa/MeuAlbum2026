import { useCallback, useEffect, useState } from "react";
import { TEAMS, TOTAL_STICKERS, stickerIds } from "@/data/teams";

const STORAGE_KEY = "wc2026-album-v1";

// state[stickerId] = number of copies (0 = not owned, 1 = owned, 2+ = owned + repeats)
export type AlbumState = Record<string, number>;

function load(): AlbumState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AlbumState) : {};
  } catch {
    return {};
  }
}

export function useAlbum() {
  const [state, setState] = useState<AlbumState>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const getCount = useCallback((id: string) => state[id] ?? 0, [state]);

  const toggleOwn = useCallback((id: string) => {
    setState((s) => {
      const cur = s[id] ?? 0;
      const next = { ...s };
      if (cur === 0) next[id] = 1;
      else if (cur === 1) delete next[id];
      else next[id] = cur; // se tem repetidas, não desliga; usar setCount
      return next;
    });
  }, []);

  const addRepeat = useCallback((id: string) => {
    setState((s) => ({ ...s, [id]: (s[id] ?? 0) + 1 }));
  }, []);

  const removeRepeat = useCallback((id: string) => {
    setState((s) => {
      const cur = s[id] ?? 0;
      if (cur <= 1) return s;
      return { ...s, [id]: cur - 1 };
    });
  }, []);

  const setCount = useCallback((id: string, n: number) => {
    setState((s) => {
      const next = { ...s };
      if (n <= 0) delete next[id];
      else next[id] = n;
      return next;
    });
  }, []);

  // stats
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
    hydrated,
    getCount,
    toggleOwn,
    addRepeat,
    removeRepeat,
    setCount,
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
