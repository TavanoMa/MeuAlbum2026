import { Routes, Route, Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import HomePage from "@/pages/Home";
import RepeatsPage from "@/pages/Repeats";
import TeamPage from "@/pages/Team";

function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-5xl font-black">404</h1>
      <p className="mt-2 text-sm text-muted-foreground">Página não encontrada.</p>
      <Link to="/" className="mt-6 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
        Voltar ao álbum
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/repetidas" element={<RepeatsPage />} />
        <Route path="/team/:code" element={<TeamPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}
