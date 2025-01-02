import { useGame } from "../contexts/GameContext";
import ShipManagement from "./ShipManagement";
import ResourceDisplay from "./ResourceDisplay";
import BaseUpgrades from "./BaseUpgrades";
import StockMarket from "./StockMarket";
import ShipUpgrades from "./ShipUpgrades";
import MineralRefining from "./MineralRefining";
import MiningStats from "./MiningStats";

export default function Game() {
  const { state } = useGame();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6 bg-white rounded-lg p-4 shadow-sm">
        <h1 className="text-2xl font-bold">Space Mining Idle</h1>
        <div className="flex gap-6">
          <div className="text-xl font-semibold">
            Credits: {state.credits.toFixed(2)}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-red-600 font-medium">Alien Danger:</span>
            <div className="w-40 bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-red-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${state.alienDanger}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Resources */}
        <div className="col-span-3">
          <ResourceDisplay />
        </div>

        {/* Middle Column - Ships, Mining Stats, and Upgrades */}
        <div className="col-span-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6">
            <ShipManagement />
            <MiningStats />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <ShipUpgrades />
            <BaseUpgrades />
          </div>
        </div>

        {/* Right Column - Market */}
        <div className="col-span-3">
          <StockMarket />
        </div>
      </div>
    </div>
  );
}
