import { useGame } from "../contexts/GameContext";
import { MineralType } from "../types/game";
import { MINERALS } from "../constants/gameConstants";
import { useState, useEffect } from "react";
import { useToast } from "./Toast";

export default function ResourceDisplay() {
  const { state, dispatch } = useGame();
  const { showToast } = useToast();
  const [refineTargets, setRefineTargets] = useState<
    Record<MineralType, number>
  >(
    () =>
      Object.fromEntries(MINERALS.map((m) => [m.name, 0])) as Record<
        MineralType,
        number
      >
  );
  const [refineProgress, setRefineProgress] = useState<
    Record<MineralType, number>
  >(
    () =>
      Object.fromEntries(MINERALS.map((m) => [m.name, 0])) as Record<
        MineralType,
        number
      >
  );
  const [lastRefineTime, setLastRefineTime] = useState<
    Record<MineralType, number>
  >(
    () =>
      Object.fromEntries(MINERALS.map((m) => [m.name, Date.now()])) as Record<
        MineralType,
        number
      >
  );

  const BASE_REFINE_TIME = 2000; // 2 seconds base time to refine one unit

  const updateRefineTarget = (mineral: MineralType, value: string) => {
    const percent = Math.max(0, Math.min(100, Number(value) || 0));
    setRefineTargets((prev) => ({
      ...prev,
      [mineral]: percent,
    }));
  };

  // Handle auto-refining with progress
  useEffect(() => {
    const intervals = MINERALS.map((mineral) => {
      if (refineTargets[mineral.name] === 0) return null;

      return setInterval(() => {
        const now = Date.now();
        const mineralLastRefine = lastRefineTime[mineral.name];
        const refineTime = BASE_REFINE_TIME / state.baseStats.refiningSpeed;
        const elapsed = now - mineralLastRefine;

        if (elapsed >= refineTime) {
          // Time to refine a unit
          const rawAmount = state.minerals[mineral.name];
          const targetRefined = Math.floor(
            rawAmount * (refineTargets[mineral.name] / 100)
          );
          const currentRefined = state.refinedMinerals[mineral.name];

          if (targetRefined > currentRefined && rawAmount > 0) {
            dispatch({
              type: "REFINE_MINERAL",
              payload: {
                mineral: mineral.name,
                amount: 1,
              },
            });
          }

          setLastRefineTime((prev) => ({
            ...prev,
            [mineral.name]: now,
          }));
          setRefineProgress((prev) => ({
            ...prev,
            [mineral.name]: 0,
          }));
        } else {
          // Update progress
          setRefineProgress((prev) => ({
            ...prev,
            [mineral.name]: (elapsed / refineTime) * 100,
          }));
        }
      }, 50);
    });

    return () => {
      intervals.forEach((interval) => interval && clearInterval(interval));
    };
  }, [
    state.minerals,
    state.refinedMinerals,
    refineTargets,
    state.baseStats.refiningSpeed,
  ]);

  return (
    <div className="game-card">
      <h2 className="text-lg font-bold mb-4">Resources</h2>
      <div className="space-y-2">
        {MINERALS.map((mineral) => (
          <div key={mineral.name} className="bg-gray-50 rounded p-3">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{mineral.name}</span>
                <span className="text-xs text-gray-500">
                  ({mineral.rarity})
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <div className="flex gap-2 items-center">
                    <span className="text-sm font-medium">
                      {Math.floor(state.minerals[mineral.name])}
                    </span>
                    <span className="text-blue-600 font-medium">
                      {Math.floor(state.refinedMinerals[mineral.name])}
                    </span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <span className="text-xs text-gray-500">Raw</span>
                    <span className="text-xs text-blue-500">Refined</span>
                  </div>
                </div>
                <div className="w-24 flex flex-col gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={refineTargets[mineral.name]}
                    onChange={(e) =>
                      updateRefineTarget(mineral.name, e.target.value)
                    }
                    className="w-full px-2 py-1 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="0%"
                  />
                  {refineTargets[mineral.name] > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-50"
                        style={{ width: `${refineProgress[mineral.name]}%` }}
                      />
                    </div>
                  )}
                  <div className="text-xs text-gray-500 text-center">
                    Auto-Refine {refineTargets[mineral.name]}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
