import { useGame } from "../contexts/GameContext";
import { Progress } from "./ui/progress";

export function BuildProgress() {
  const { state } = useGame();
  const { ships, buildProgress } = state;

  if (ships.building === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Building Ships: {ships.building}</span>
        <span>{Math.round(buildProgress)}%</span>
      </div>
      <Progress value={buildProgress} className="w-full" />
    </div>
  );
}
