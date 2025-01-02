import { useGame } from "../contexts/GameContext";
import { Progress } from "./ui/progress";

export function RepairProgress() {
  const { state } = useGame();
  const { ships, repairProgress } = state;

  if (ships.repairing === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Repairing Ships: {ships.repairing}</span>
        <span>{Math.round(repairProgress)}%</span>
      </div>
      <Progress value={repairProgress} className="w-full" />
    </div>
  );
}
