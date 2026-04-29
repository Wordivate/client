import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSocket } from "../context/SocketContext";

export default function PlayerGame() {
  const socket = useSocket();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleNewQuestion = ({ index, text, total }) => {
      setQuestion({ index, text, total });
      setAnswer("");
      setSubmitted(false);
      setGrading(false);
    };

    const handleGradingStart = () => {
      setGrading(true);
    };

    const handleShowLeaderboard = () => {
      navigate("/leaderboard");
    };

    socket.on("new_question", handleNewQuestion);
    socket.on("grading_start", handleGradingStart);
    socket.on("show_leaderboard", handleShowLeaderboard);

    // Minta soal aktif ke server setelah listener terpasang
    socket.emit("get_current_question");

    return () => {
      socket.off("new_question", handleNewQuestion);
      socket.off("grading_start", handleGradingStart);
      socket.off("show_leaderboard", handleShowLeaderboard);
    };
  }, [socket, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = answer.trim().split(/\s+/)[0];
    if (!clean || !question) return;

    socket.emit("submit_answer", {
      questionIndex: question.index,
      answer: clean.toLowerCase(),
    });
    setSubmitted(true);
  };

  if (grading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h2>Menghitung hasil...</h2>
      </div>
    );
  }

  if (!question) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h2>Menunggu soal...</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "2rem auto",
        padding: "1rem",
        textAlign: "center",
      }}
    >
      <div style={{ color: "#666", marginBottom: "1rem" }}>
        Soal {question.index + 1} dari {question.total}
      </div>

      <h2 style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>
        {question.text}
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value.trim())}
          disabled={submitted}
          required
          placeholder="Ketik 1 kata jawaban"
          style={{
            padding: "0.75rem",
            fontSize: "1.2rem",
            textAlign: "center",
          }}
        />
        <button
          type="submit"
          disabled={submitted || !answer.trim()}
          style={{
            padding: "0.75rem",
            fontSize: "1.1rem",
            cursor: submitted || !answer.trim() ? "not-allowed" : "pointer",
            backgroundColor: submitted ? "#10b981" : "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          {submitted ? "Jawaban terkirim ✓" : "Kirim Jawaban"}
        </button>
      </form>
    </div>
  );
}
