import { useNavigate } from "react-router";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div>
      <h1>Wordivate Trivia</h1>
      <button onClick={() => navigate("/host")}>Buat Room (Host)</button>
      <button onClick={() => navigate("/play")}>Masuk Room (Player)</button>
    </div>
  );
}
