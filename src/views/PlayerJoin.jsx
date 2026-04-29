import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSocket } from "../context/SocketContext";

export default function PlayerJoin() {
  const socket = useSocket();
  const navigate = useNavigate();

  const [roomCode, setRoomCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleJoinError = ({ message }) => {
      setErrorMsg(message);
      setJoined(false);
    };

    const handlePlayerJoined = ({ players }) => {
      setPlayers(players);
    };

    const handleGameStarted = () => {
      navigate("/play/game");
    };

    socket.on("join_error", handleJoinError);
    socket.on("player_joined", handlePlayerJoined);
    socket.on("game_started", handleGameStarted);

    return () => {
      socket.off("join_error", handleJoinError);
      socket.off("player_joined", handlePlayerJoined);
      socket.off("game_started", handleGameStarted);
    };
  }, [socket, navigate]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!roomCode || !nickname) return;
    setErrorMsg("");
    socket.emit("join_room", { roomCode: roomCode.toUpperCase(), nickname });
    setJoined(true);
  };

  if (joined && !errorMsg) {
    return (
      <div className="player-waiting" style={{ textAlign: "center", padding: "2rem" }}>
        <h2>Menunggu host memulai...</h2>
        <div style={{ marginTop: "2rem" }}>
          <p>Pemain yang sudah masuk:</p>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {players.map((p, i) => (
              <li key={i} style={{ fontSize: "1.2rem", margin: "0.5rem 0" }}>
                {p.nickname}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="player-join" style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem" }}>
      <h2 style={{ textAlign: "center" }}>Masuk ke Room</h2>
      <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Room Code:</label>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            maxLength={6}
            required
            style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Nickname:</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={16}
            required
            style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
          />
        </div>
        {errorMsg && <p style={{ color: "red", margin: 0 }}>{errorMsg}</p>}
        <button type="submit" style={{ padding: "0.75rem", fontSize: "1rem", cursor: "pointer" }}>
          Masuk
        </button>
      </form>
    </div>
  );
}
