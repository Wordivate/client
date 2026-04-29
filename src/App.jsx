import { BrowserRouter, Routes, Route } from "react-router";
import { useContext } from "react";
import { SocketProvider } from "./context/SocketContext";
import { ThemeContext } from "./context/ThemeContext";
import Home from "./views/Home";
import HostLobby from "./views/HostLobby";
import HostGame from "./views/HostGame";
import PlayerJoin from "./views/PlayerJoin";
import PlayerGame from "./views/PlayerGame";
import Leaderboard from "./views/Leaderboard";

function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  // Perbaiki pengecekan tema gelap dari "abyss" menjadi "dim"
  const isDark = theme === "dim";

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn"
      title={isDark ? "Ganti ke Light Mode" : "Ganti ke Dark Mode"}
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <svg
          className="theme-icon sun-icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg
          className="theme-icon moon-icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}

export default function App() {
  return (
    <div>
      <ThemeToggle />
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/host" element={<HostLobby />} />
            <Route path="/host/game" element={<HostGame />} />
            <Route path="/play" element={<PlayerJoin />} />
            <Route path="/play/game" element={<PlayerGame />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </div>
  );
}
