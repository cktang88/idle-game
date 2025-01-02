import { useGame } from "../contexts/GameContext";
import { ShipStatus } from "../types/game";
import { RepairProgress } from "./RepairProgress";
import { BuildProgress } from "./BuildProgress";
import { useEffect } from "react";
import { BASE_SHIP_BUILD_TIME } from "../constants/gameConstants";

const STATUS_COLORS: Record<ShipStatus, { bg: string; text: string }> = {
  idle: { bg: "bg-gray-100", text: "text-gray-800" },
  mining: { bg: "bg-green-100", text: "text-green-800" },
  repairing: { bg: "bg-yellow-100", text: "text-yellow-800" },
  building: { bg: "bg-purple-100", text: "text-purple-800" },
};

export default function ShipManagement() {
  const { state, dispatch } = useGame();

  const totalShips = Object.values(state.ships).reduce((a, b) => a + b, 0);
  const canBuildShip = state.credits >= 100 && state.ships.building === 0;

  const sendAllMining = () => {
    if (state.ships.idle > 0) {
      dispatch({
        type: "UPDATE_SHIP_COUNTS",
        payload: {
          idle: 0,
          mining: state.ships.idle + state.ships.mining,
        },
      });
    }
  };

  const startBuildingShip = () => {
    if (canBuildShip) {
      dispatch({ type: "START_BUILDING_SHIP" });
    }
  };

  // Ship building progress loop
  useEffect(() => {
    if (state.ships.building === 0) {
      if (state.buildProgress !== 0) {
        dispatch({ type: "UPDATE_BUILD_PROGRESS", payload: 0 });
      }
      return;
    }

    const interval = setInterval(() => {
      // Calculate build progress increment based on production speed
      const progressIncrement = (state.baseStats.shipProduction / 10) * 100;
      const newProgress = Math.min(
        100,
        state.buildProgress + progressIncrement
      );
      dispatch({ type: "UPDATE_BUILD_PROGRESS", payload: newProgress });
    }, BASE_SHIP_BUILD_TIME / state.baseStats.shipProduction);

    return () => clearInterval(interval);
  }, [
    state.ships.building,
    state.buildProgress,
    state.baseStats.shipProduction,
    dispatch,
  ]);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Ships ({totalShips})</h2>
        <div className="flex gap-2">
          <button
            onClick={startBuildingShip}
            disabled={!canBuildShip}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 text-sm"
          >
            Build Ship (100 credits)
          </button>
          <button
            onClick={sendAllMining}
            disabled={state.ships.idle === 0}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 text-sm"
          >
            Send All Mining
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(Object.entries(state.ships) as [ShipStatus, number][]).map(
          ([status, count]) => (
            <div
              key={status}
              className={`${STATUS_COLORS[status].bg} ${STATUS_COLORS[status].text} rounded p-2 flex justify-between items-center`}
            >
              <span className="capitalize">{status}</span>
              <span className="font-medium">{count}</span>
            </div>
          )
        )}
      </div>

      {state.ships.building > 0 && (
        <div className="mt-4">
          <BuildProgress />
        </div>
      )}

      {state.ships.repairing > 0 && (
        <div className="mt-4">
          <RepairProgress />
        </div>
      )}

      <div className="mt-4 space-y-2">
        <h3 className="font-medium text-sm">Global Ship Stats</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(state.shipStats).map(([stat, value]) => (
            <div
              key={stat}
              className="flex justify-between items-center bg-gray-50 p-2 rounded"
            >
              <span className="capitalize">
                {stat.replace(/([A-Z])/g, " $1").trim()}
              </span>
              <span>{Math.floor(value * 10) / 10}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
