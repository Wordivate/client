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
      className="theme-toggle-btn"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    ></button>
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
