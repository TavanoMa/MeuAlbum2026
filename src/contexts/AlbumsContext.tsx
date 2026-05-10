import { createContext, useContext, type ReactNode } from "react";
import { useAlbums } from "@/hooks/useAlbums";

const Ctx = createContext<ReturnType<typeof useAlbums> | undefined>(undefined);

export function AlbumsProvider({ children }: { children: ReactNode }) {
  const v = useAlbums();
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}

export function useAlbumsCtx() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAlbumsCtx must be used within AlbumsProvider");
  return v;
}
