import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Album = {
  id: string;
  name: string;
  invite_code: string;
  owner_id: string;
  created_at: string;
};

const STORAGE_KEY = "wc2026-current-album";

function genCode() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export function useAlbums() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentId, setCurrentIdState] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data: members } = await supabase
      .from("album_members")
      .select("album_id");
    const ids = (members ?? []).map((m) => m.album_id);
    if (ids.length === 0) {
      setAlbums([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("albums")
      .select("id, name, invite_code, owner_id, created_at")
      .in("id", ids)
      .order("created_at", { ascending: true });
    setAlbums((data as Album[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) setCurrentIdState(stored);
  }, [reload]);

  useEffect(() => {
    if (!currentId && albums.length > 0) {
      setCurrentIdState(albums[0].id);
    }
    if (currentId && albums.length > 0 && !albums.find((a) => a.id === currentId)) {
      setCurrentIdState(albums[0].id);
    }
  }, [albums, currentId]);

  const setCurrentId = useCallback((id: string | null) => {
    setCurrentIdState(id);
    if (id) sessionStorage.setItem(STORAGE_KEY, id);
    else sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const createAlbum = useCallback(
    async (name: string) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Não autenticado");
      let code = genCode();
      // retry on rare collision
      for (let i = 0; i < 3; i++) {
        const { data, error } = await supabase
          .from("albums")
          .insert({ name, invite_code: code, owner_id: u.user.id })
          .select()
          .single();
        if (!error && data) {
          await reload();
          setCurrentId(data.id);
          return data as Album;
        }
        code = genCode();
      }
      throw new Error("Falha ao criar álbum");
    },
    [reload, setCurrentId],
  );

  const joinAlbum = useCallback(
    async (code: string) => {
      const { data, error } = await supabase.rpc("join_album_by_code", {
        _code: code.trim().toUpperCase(),
      });
      if (error) throw error;
      await reload();
      if (data) setCurrentId(data as string);
      return data as string;
    },
    [reload, setCurrentId],
  );

  const leaveAlbum = useCallback(
    async (albumId: string) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      await supabase
        .from("album_members")
        .delete()
        .eq("album_id", albumId)
        .eq("user_id", u.user.id);
      await reload();
    },
    [reload],
  );

  const deleteAlbum = useCallback(
    async (albumId: string) => {
      await supabase.from("albums").delete().eq("id", albumId);
      await reload();
    },
    [reload],
  );

  const current = albums.find((a) => a.id === currentId) ?? null;

  return {
    albums,
    loading,
    current,
    currentId,
    setCurrentId,
    createAlbum,
    joinAlbum,
    leaveAlbum,
    deleteAlbum,
    reload,
  };
}
