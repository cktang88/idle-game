import { GameProvider } from "./contexts/GameContext";
import { ToastProvider } from "./components/Toast";
import Game from "./components/Game";

export default function App() {
  return (
    <ToastProvider>
      <GameProvider>
        <Game />
      </GameProvider>
    </ToastProvider>
  );
}
