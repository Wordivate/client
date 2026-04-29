import { useNavigate } from "react-router";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Decorative blobs */}
      <div className="blob blob-primary blob-top-left" />
      <div className="blob blob-secondary blob-bottom-right" />
      <div className="blob blob-accent blob-center" />

      <div className="home-content">
        <div className="header-section">
          <h1 className="title text-glow">
            <span className="title-primary">Word</span>
            <span className="title-base">ivate</span>
          </h1>
          <p className="subtitle">
            Quiz kata real-time yang seru buat dimainkan bareng!
          </p>
        </div>

        <div className="divider">
          <span>✦</span>
          <span>✦</span>
          <span>✦</span>
        </div>

        <div className="action-cards">
          <button onClick={() => navigate("/host")} className="btn btn-primary">
            Buat Room
          </button>
          <button
            onClick={() => navigate("/play")}
            className="btn btn-secondary"
          >
            Masuk Room
          </button>
        </div>

        <p className="footer-note">
          Wordivate ✦ Powered by Gemini AI ✦ Real-time via Socket.IO
        </p>
      </div>
    </div>
  );
}
