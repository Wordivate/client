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
  const isDark = theme === "abyss";
  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 btn btn-sm btn-ghost btn-circle"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? (
        /* Sun icon */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z"
          />
        </svg>
      ) : (
        /* Moon icon */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
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
