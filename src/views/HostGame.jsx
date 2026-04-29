import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useSocket } from "../context/SocketContext";
import WordCloud from "../components/WordCloud";
import "../index.css";

export default function HostGame() {
  const socket = useSocket();
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [isLastQuestion, setIsLastQuestion] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleNewQuestion = ({ index, text, total }) => {
      setCurrentQuestionIndex(index);
      setQuestion(text);
      setTotalQuestions(total);
      setAnswers([]);
      setIsLastQuestion(index === total - 1);
    };
    const handleWordcloudUpdate = ({ answers }) => setAnswers(answers);
    const handleGradingStart = () => setLoading(true);
    const handleShowLeaderboard = () => navigate("/leaderboard");

    socket.on("new_question", handleNewQuestion);
    socket.on("wordcloud_update", handleWordcloudUpdate);
    socket.on("grading_start", handleGradingStart);
    socket.on("show_leaderboard", handleShowLeaderboard);
    socket.emit("get_current_question");

    return () => {
      socket.off("new_question", handleNewQuestion);
      socket.off("wordcloud_update", handleWordcloudUpdate);
      socket.off("grading_start", handleGradingStart);
      socket.off("show_leaderboard", handleShowLeaderboard);
    };
  }, [socket, navigate]);

  const progress = totalQuestions
    ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)
    : 0;

  return (
    <div className="host-game-container">
      {/* Background blobs */}
      <div className="blob hg-blob-primary" />
      <div className="blob hg-blob-accent" />

      <div className="hg-wrapper">
        {/* Header bar */}
        <div className="hg-header">
          <h1 className="title-glow-primary">🎮 Host Game</h1>
          {totalQuestions > 0 && (
            <div className="badge-outline">
              {currentQuestionIndex + 1} / {totalQuestions}
            </div>
          )}
        </div>

        {/* Progress bar */}
        {totalQuestions > 0 && (
          <div className="progress-container">
            <progress className="progress-bar" value={progress} max="100" />
          </div>
        )}

        {/* Question card */}
        {question ? (
          <div className="game-card question-card-active">
            <div className="game-card-body">
              <p className="question-label">Soal {currentQuestionIndex + 1}</p>
              <p className="question-text">{question}</p>
            </div>
          </div>
        ) : (
          <div className="game-card">
            <div className="game-card-body">
              <span className="loading-dots"></span>
              <p className="waiting-text">Menunggu soal...</p>
            </div>
          </div>
        )}

        {/* Word cloud */}
        <div className="game-card">
          <div className="game-card-body-compact">
            <h2 className="card-title-small">☁️ Jawaban Peserta</h2>
            <div className="wordcloud-container">
              {answers.length > 0 ? (
                <WordCloud answers={answers} width={560} height={260} />
              ) : (
                <p className="waiting-text">Belum ada jawaban masuk...</p>
              )}
            </div>
          </div>
        </div>

        {/* Grading state */}
        {loading && (
          <div className="alert-warning">
            <span className="spinner-small"></span>
            <span>Sedang mengoreksi jawaban dengan AI...</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="action-buttons">
          {!isLastQuestion && (
            <button
              onClick={() => socket?.emit("next_question")}
              disabled={loading}
              className="btn-game btn-game-primary"
            >
              Soal Berikutnya →
            </button>
          )}
          {isLastQuestion && (
            <button
              onClick={() => socket?.emit("end_game")}
              disabled={loading}
              className="btn-game btn-game-success"
            >
              🏆 Selesai & Lihat Hasil
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
