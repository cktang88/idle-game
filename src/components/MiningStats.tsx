import { useGame } from "../contexts/GameContext";
import { useState, useEffect } from "react";
import {
  MINERALS,
  BASE_MINING_TICK,
  BASE_ALIEN_DANGER_INCREASE,
  JUNK_CHANCE,
} from "../constants/gameConstants";

export default function MiningStats() {
  const { state } = useGame();
  const [totalMined, setTotalMined] = useState<Record<string, number>>({});
  const [miningTicks, setMiningTicks] = useState(0);
  const [shipsLost, setShipsLost] = useState(0);
  const [junkCollected, setJunkCollected] = useState(0);
  const [tickProgress, setTickProgress] = useState(0);
  const [timeToNextTick, setTimeToNextTick] = useState(BASE_MINING_TICK);
  const [lastTickTime, setLastTickTime] = useState(Date.now());

  // Calculate next tick's alien danger increase
  const nextDangerIncrease =
    state.ships.mining > 0
      ? BASE_ALIEN_DANGER_INCREASE *
        (1 - state.shipStats.stealth / 100) *
        state.ships.mining
      : 0;

  // Update tick progress with reset
  useEffect(() => {
    if (state.ships.mining === 0) {
      setTickProgress(0);
      setTimeToNextTick(BASE_MINING_TICK);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastTickTime;

      if (elapsed >= BASE_MINING_TICK) {
        setLastTickTime(now);
        setTickProgress(0);
      } else {
        const progress = (elapsed / BASE_MINING_TICK) * 100;
        setTickProgress(Math.min(100, progress));
        setTimeToNextTick(BASE_MINING_TICK - elapsed);
      }
    }, 50); // Update every 50ms for smooth progress

    return () => clearInterval(interval);
  }, [state.ships.mining, lastTickTime]);

  // Track mining stats
  useEffect(() => {
    if (state.ships.mining > 0) {
      setMiningTicks((prev) => prev + 1);
    }
  }, [state.ships.mining]);

  // Track mining results from game state changes
  useEffect(() => {
    const newJunkCount = Math.floor(
      Math.random() * state.ships.mining * JUNK_CHANCE
    );
    if (newJunkCount > 0) {
      setJunkCollected((prev) => prev + newJunkCount);
    }
  }, [state.ships.mining]);

  // Track total mined with better accuracy
  useEffect(() => {
    setTotalMined((prev) => {
      const newTotalMined = { ...prev };
      MINERALS.forEach((mineral) => {
        const currentTotal = prev[mineral.name] || 0;
        const newAmount = state.minerals[mineral.name];
        if (newAmount > currentTotal) {
          newTotalMined[mineral.name] = newAmount;
        }
      });
      return newTotalMined;
    });
  }, [state.minerals]);

  return (
    <div className="game-card">
      <h2 className="text-lg font-bold mb-4">Mining Operations</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded p-3">
          <h3 className="text-sm font-medium mb-2">Ship Status</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Mining:</span>
              <span className="text-green-600 font-medium">
                {state.ships.mining}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Returning:</span>
              <span className="text-blue-600 font-medium">
                {state.ships.returning}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Repairing:</span>
              <span className="text-yellow-600 font-medium">
                {state.ships.repairing}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Idle:</span>
              <span className="text-gray-600 font-medium">
                {state.ships.idle}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded p-3">
          <h3 className="text-sm font-medium mb-2">Mining Stats</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Time Mining:</span>
              <span>{Math.floor(miningTicks * 5)}s</span>
            </div>
            <div className="flex justify-between">
              <span>Ships Lost:</span>
              <span className="text-red-600 font-medium">{shipsLost}</span>
            </div>
            <div className="flex justify-between">
              <span>Junk Collected:</span>
              <span className="text-gray-600 font-medium">{junkCollected}</span>
            </div>
          </div>
        </div>

        <div className="col-span-2 bg-gray-50 rounded p-3">
          <h3 className="text-sm font-medium mb-2">Current Mining Operation</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Next Tick:</span>
              <span>{(timeToNextTick / 1000).toFixed(1)}s</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-50"
                style={{ width: `${tickProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span>Alien Danger:</span>
              <div className="flex items-center gap-1">
                <span className="text-red-600 font-medium">
                  {Math.floor(state.alienDanger)}%
                </span>
                {nextDangerIncrease > 0 && (
                  <span className="text-red-400 text-xs">
                    (+{nextDangerIncrease.toFixed(1)}%)
                  </span>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              {/* Current danger */}
              <div
                className="bg-red-700 h-2 transition-all duration-300"
                style={{ width: `${state.alienDanger}%` }}
              />
              {/* Predicted next tick danger increase */}
              <div
                className="bg-red-400 h-2 transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    state.alienDanger + nextDangerIncrease
                  )}%`,
                  marginTop: "-0.5rem",
                  opacity: 0.5,
                }}
              />
            </div>
          </div>
        </div>

        <div className="col-span-2 bg-gray-50 rounded p-3">
          <h3 className="text-sm font-medium mb-2">Resources Mined</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {MINERALS.map((mineral) => (
              <div key={mineral.name} className="flex justify-between">
                <span>{mineral.name}:</span>
                <span className="font-medium">
                  {Math.floor(totalMined[mineral.name] || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
