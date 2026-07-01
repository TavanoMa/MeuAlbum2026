import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AlbumsProvider } from "@/contexts/AlbumsContext";
import HomePage from "@/pages/Home";
import RepeatsPage from "@/pages/Repeats";
import MissingPage from "@/pages/Missing";
import TeamPage from "@/pages/Team";
import LoginPage from "@/pages/Login";
import AlbumsPage from "@/pages/Albums";
import TradesPage from "./pages/TradesPage";

function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-5xl font-black">404</h1>
      <p className="mt-2 text-sm text-muted-foreground">Página não encontrada.</p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
      >
        Voltar ao álbum
      </Link>
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Carregando…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <AlbumsProvider>
                <AppShell>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/repetidas" element={<RepeatsPage />} />
                    <Route path="/faltando" element={<MissingPage />} />
                    <Route path="/albums" element={<AlbumsPage />} />
                    <Route path="/trades" element={<TradesPage />} />
                    <Route path="/team/:code" element={<TeamPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppShell>
              </AlbumsProvider>
            </RequireAuth>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
