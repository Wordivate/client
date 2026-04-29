import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useSocket } from "../context/SocketContext";
import "../index.css";

export default function Leaderboard() {
  const socket = useSocket();
  const navigate = useNavigate();
  const [rankings, setRankings] = useState(null);

  const myNickname = sessionStorage.getItem("nickname");
  const isPlayer = !!myNickname;

  useEffect(() => {
    if (!socket) return;

    const handleShowLeaderboard = ({ rankings: incomingRankings }) => {
      if (incomingRankings?.length) setRankings(incomingRankings);
    };

    socket.on("show_leaderboard", handleShowLeaderboard);
    socket.emit("get_leaderboard");

    return () => socket.off("show_leaderboard", handleShowLeaderboard);
  }, [socket]);

  if (!rankings) {
    return (
      <div className="lb-full-screen">
        <div className="lb-centered">
          <span className="loading-dots lb-spinner-primary"></span>
          <h2 className="lb-title">Memuat hasil...</h2>
        </div>
      </div>
    );
  }

  const myData = isPlayer
    ? rankings.find(
        (p) => p.nickname?.toLowerCase() === myNickname?.toLowerCase(),
      )
    : null;

  const top3 = rankings.slice(0, 3);
  const rest = rankings.slice(3); 
  const podium = [top3[1], top3[0], top3[2]].filter(Boolean);
  const gameQuestions = rankings[0]?.answers || [];

  return (
    <div className="lb-container">
      <div className="blob lb-blob-top" />
      <div className="blob lb-blob-bottom-left" />
      <div className="blob lb-blob-bottom-right" />

      {/* --- HEADER --- */}
      <div className="lb-header">
        <span className="lb-emoji-large">{isPlayer ? "✨" : "🏆"}</span>
        <h1 className="lb-main-title">
          {isPlayer ? "Hasil Kamu" : "Leaderboard"}
        </h1>
        <p className="lb-subtitle">
          {isPlayer
            ? "Hebat! Kamu sudah berjuang."
            : "Hasil resmi pertandingan"}
        </p>
      </div>

      {/* --- KONTEN UTAMA --- */}
      {isPlayer ? (
        /* VIEW UNTUK PLAYER */
        myData ? (
          <>
            <div className="player-rank-announcement">
              <div className="rank-circle">
                <span className="rank-label">Peringkat</span>
                <span className="rank-number">#{myData.rank}</span>
              </div>
              <div className="player-summary-stats">
                <div className="summary-item">
                  <span className="summary-val">{myData.score}</span>
                  <span className="summary-lab">Poin</span>
                </div>
                <div className="summary-item">
                  <span className="summary-val">
                    {myData.total
                      ? Math.round((myData.score / myData.total) * 100)
                      : 0}
                    %
                  </span>
                  <span className="summary-lab">Akurasi</span>
                </div>
              </div>
            </div>

            <div className="lb-detail-section">
              <h2 className="section-title">Detail Jawaban Kamu</h2>
              <div className="lb-questions-list">
                {myData.answers.map((item, idx) => (
                  <QuestionCard
                    key={idx}
                    item={item}
                    idx={idx}
                    isPlayerView={true}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="lb-centered">
            <p>Data kamu tidak ditemukan di leaderboard.</p>
          </div>
        )
      ) : (
        /* VIEW UNTUK HOST */
        <>
          {top3.length > 0 && (
            <div className="podium-wrapper">
              {podium.map((player) => (
                <PodiumSlot key={player.nickname} player={player} />
              ))}
            </div>
          )}

          {/* Sisa Peringkat (Rank 4 ke atas) untuk Host */}
          {rest.length > 0 && (
            <div className="lb-rest-rankings">
              <h2 className="section-title">Peringkat Lainnya</h2>
              <div className="rest-list">
                {rest.map((player) => (
                  <div key={player.nickname} className="rest-item">
                    <span className="rest-rank">#{player.rank}</span>
                    <span className="rest-name">{player.nickname}</span>
                    <span className="rest-score">{player.score} pt</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="lb-detail-section">
            <h2 className="section-title">Daftar Pertanyaan & Kunci Jawaban</h2>
            <div className="lb-questions-list">
              {gameQuestions.map((item, idx) => (
                <QuestionCard
                  key={idx}
                  item={item}
                  idx={idx}
                  isPlayerView={false}
                />
              ))}
            </div>
          </div>
        </>
      )}

      <button
        onClick={() => {
          sessionStorage.removeItem("nickname");
          navigate("/");
        }}
        className="btn-game btn-game-primary lb-btn-play-again"
      >
        🔄 Main Lagi
      </button>
    </div>
  );
}

// Komponen Kecil untuk Kartu Pertanyaan
function QuestionCard({ item, idx, isPlayerView }) {
  return (
    <div className="lb-q-card">
      <div className="lb-q-header">
        <span className="lb-q-number">Soal {idx + 1}</span>
        {isPlayerView && (
          <span
            className={`badge-indicator ${item.correct ? "indicator-success" : "indicator-error"}`}
          >
            {item.correct ? "✓ Benar" : "✗ Salah"}
          </span>
        )}
      </div>
      <p className="lb-q-text">
        {item.questionText || `Pertanyaan ${idx + 1}`}
      </p>
      <div className="lb-q-answer-box">
        <span className="lb-q-label">
          {isPlayerView ? "Jawabanmu:" : "Kunci Jawaban:"}
        </span>
        <span
          className={`lb-q-value ${isPlayerView && !item.correct ? "text-error" : "text-success"}`}
        >
          {isPlayerView
            ? item.answer || "Tidak dijawab"
            : item.baseAnswer || "—"}
        </span>
      </div>
    </div>
  );
}

function PodiumSlot({ player }) {
  const configs = {
    1: { badge: "🥇", rankClass: "podium-1", order: "order-2" },
    2: { badge: "🥈", rankClass: "podium-2", order: "order-1" },
    3: { badge: "🥉", rankClass: "podium-3", order: "order-3" },
  };
  const c = configs[player.rank] || configs[3];
  return (
    <div className={`podium-slot ${c.order}`}>
      <span className="podium-badge">{c.badge}</span>
      <p className="podium-name">{player.nickname}</p>
      <div className={`podium-bar ${c.rankClass}`}>
        <span className="podium-rank-text">#{player.rank}</span>
      </div>
    </div>
  );
}
