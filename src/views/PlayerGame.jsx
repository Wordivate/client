import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSocket } from "../context/SocketContext";
import "../index.css";

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
    const handleGradingStart = () => setGrading(true);
    const handleShowLeaderboard = () => navigate("/leaderboard");

    socket.on("new_question", handleNewQuestion);
    socket.on("grading_start", handleGradingStart);
    socket.on("show_leaderboard", handleShowLeaderboard);
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

  // --- STATE 1: MENGHITUNG HASIL ---
  if (grading) {
    return (
      <div className="pg-full-screen">
        <div className="pg-centered-content">
          <span className="loading-dots pg-loading-warning"></span>
          <h2 className="pg-title">Menghitung hasil...</h2>
          <p className="pg-subtitle">
            AI sedang mengoreksi jawaban semua peserta
          </p>
        </div>
      </div>
    );
  }

  // --- STATE 2: MENUNGGU SOAL ---
  if (!question) {
    return (
      <div className="pg-full-screen">
        <div className="pg-centered-content">
          <div className="spinner-ring pg-spinner-primary"></div>
          <h2 className="pg-title mt-4">Menunggu soal...</h2>
          <p className="pg-subtitle">Host sedang mempersiapkan game</p>
        </div>
      </div>
    );
  }

  // --- STATE 3: MENJAWAB SOAL ---
  const progress = Math.round(((question.index + 1) / question.total) * 100);

  return (
    <div className="pg-container">
      <div className="blob pg-blob-top" />
      <div className="blob pg-blob-bottom" />

      <div className="pg-wrapper">
        {/* Progress & counter */}
        <div className="pg-progress-header">
          <div className="pg-progress-text">
            <span className="pg-label">Soal</span>
            <span className="badge-outline">
              {question.index + 1} / {question.total}
            </span>
          </div>
          <progress className="progress-bar" value={progress} max="100" />
        </div>

        {/* Question card */}
        <div className="game-card question-card-active pg-min-h">
          <div className="game-card-body">
            <p className="pg-question-text">{question.text}</p>
          </div>
        </div>

        {/* Answer form */}
        <div className="game-card">
          <div className="pg-form-body">
            <p className="pg-hint">Ketik 1 kata jawaban</p>
            <form onSubmit={handleSubmit} className="pg-form">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={submitted}
                required
                placeholder="Jawaban kamu..."
                className="pg-input"
                autoFocus
              />
              <button
                type="submit"
                disabled={submitted || !answer.trim()}
                className={`btn-game pg-btn-submit ${submitted ? "pg-btn-success" : "pg-btn-primary"}`}
              >
                {submitted ? "✓ Jawaban Terkirim!" : "🚀 Kirim Jawaban"}
              </button>
            </form>
          </div>
        </div>

        {submitted && (
          <div className="pg-waiting-pulse">Menunggu soal berikutnya...</div>
        )}
      </div>
    </div>
  );
}
