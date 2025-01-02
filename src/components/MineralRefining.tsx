import { useGame } from "../contexts/GameContext";
import { MineralType } from "../types/game";
import { MINERALS } from "../constants/gameConstants";
import { useToast } from "./Toast";
import { useState } from "react";

export default function MineralRefining() {
  const { state, dispatch } = useGame();
  const { showToast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<
    Record<MineralType, number>
  >(
    () =>
      Object.fromEntries(MINERALS.map((m) => [m.name, 0])) as Record<
        MineralType,
        number
      >
  );

  const refineMineral = (mineral: MineralType) => {
    const amount = selectedAmount[mineral];
    if (amount <= 0 || state.minerals[mineral] < amount) return;

    dispatch({
      type: "REFINE_MINERAL",
      payload: {
        mineral,
        amount,
      },
    });

    showToast(`Refined ${amount} ${mineral}`, "success");
  };

  const setRefineAmount = (mineral: MineralType, amount: number) => {
    setSelectedAmount((prev) => ({
      ...prev,
      [mineral]: Math.max(0, Math.min(amount, state.minerals[mineral])),
    }));
  };

  const refineMax = (mineral: MineralType) => {
    setRefineAmount(mineral, state.minerals[mineral]);
    refineMineral(mineral);
  };

  return (
    <div className="game-card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Mineral Refining</h2>
        <div className="text-sm text-gray-500 font-medium">
          Speed: {Math.floor(state.baseStats.refiningSpeed * 100)}%
        </div>
      </div>
      <div className="content-section">
        {MINERALS.map((mineral) => (
          <div key={mineral.name} className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{mineral.name}</span>
                <div className="flex gap-3 text-xs">
                  <span className="text-gray-600">
                    Raw: {Math.floor(state.minerals[mineral.name])}
                  </span>
                  <span className="text-blue-600 font-medium">
                    Refined: {Math.floor(state.refinedMinerals[mineral.name])}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max={state.minerals[mineral.name]}
                  value={selectedAmount[mineral.name]}
                  onChange={(e) =>
                    setRefineAmount(mineral.name, parseInt(e.target.value))
                  }
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>0</span>
                  <span>{selectedAmount[mineral.name]}</span>
                  <span>{Math.floor(state.minerals[mineral.name])}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => refineMineral(mineral.name)}
                  disabled={selectedAmount[mineral.name] <= 0}
                  className="px-4 py-1.5 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Refine
                </button>
                <button
                  onClick={() => refineMax(mineral.name)}
                  disabled={state.minerals[mineral.name] <= 0}
                  className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Max
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
