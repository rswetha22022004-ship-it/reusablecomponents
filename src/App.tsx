import { useState } from "react";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";

type View = "admin" | "user";

/**
 * Tiny view switcher so you can compare both dashboards.
 * In a real app you would use a router (e.g. React Router) instead.
 */
export default function App() {
  const [view, setView] = useState<View>("admin");

  return (
    <>
      <nav
        className="fixed bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-full bg-black/80 p-1 text-sm shadow-lg"
        aria-label="Switch dashboard"
      >
        {(["admin", "user"] as const).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setView(name)}
            aria-pressed={view === name}
            className={`rounded-full px-4 py-1.5 font-medium capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
              view === name ? "bg-white text-black" : "text-white/80 hover:text-white"
            }`}
          >
            {name}
          </button>
        ))}
      </nav>

      {view === "admin" ? <AdminDashboard /> : <UserDashboard />}
    </>
  );
}
