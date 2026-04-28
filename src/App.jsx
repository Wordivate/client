import { BrowserRouter, Routes, Route } from "react-router";
import { SocketProvider } from "./context/SocketContext";
import Home from "./views/Home";
import HostLobby from "./views/HostLobby";
import HostGame from "./views/HostGame";
import PlayerJoin from "./views/PlayerJoin";
import PlayerGame from "./views/PlayerGame";
import Leaderboard from "./views/Leaderboard";

export default function App() {
  return (
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
  );
}
