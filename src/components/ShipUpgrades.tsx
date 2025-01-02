import { useGame } from "../contexts/GameContext";
import { MineralType } from "../types/game";
import { MINERALS } from "../constants/gameConstants";

const UPGRADE_COSTS: Record<string, Record<MineralType, number>> = {
  miningCapacity: {
    Ferrox: 50,
    Silicor: 50,
    Ionite: 0,
    "Tritum Spark": 0,
    Celestium: 0,
    Crystite: 0,
    Xotheneium: 0,
  },
  defense: {
    Ferrox: 0,
    Silicor: 0,
    Ionite: 30,
    "Tritum Spark": 30,
    Celestium: 0,
    Crystite: 0,
    Xotheneium: 0,
  },
  evasion: {
    Ferrox: 0,
    Silicor: 0,
    Ionite: 20,
    "Tritum Spark": 0,
    Celestium: 10,
    Crystite: 0,
    Xotheneium: 0,
  },
  speed: {
    Ferrox: 30,
    Silicor: 0,
    Ionite: 0,
    "Tritum Spark": 20,
    Celestium: 0,
    Crystite: 0,
    Xotheneium: 0,
  },
  repairability: {
    Ferrox: 0,
    Silicor: 0,
    Ionite: 0,
    "Tritum Spark": 0,
    Celestium: 0,
    Crystite: 20,
    Xotheneium: 0,
  },
  stealth: {
    Ferrox: 0,
    Silicor: 40,
    Ionite: 0,
    "Tritum Spark": 0,
    Celestium: 0,
    Crystite: 20,
    Xotheneium: 0,
  },
};

const UPGRADE_MULTIPLIERS = {
  miningCapacity: 1.2,
  defense: 1.15,
  evasion: 1.1,
  speed: 1.1,
  repairability: 1.15,
  stealth: 1.1,
};

export default function ShipUpgrades() {
  const { state, dispatch } = useGame();

  const canAffordUpgrade = (stat: string) => {
    const costs = UPGRADE_COSTS[stat];
    return Object.entries(costs).every(
      ([mineral, cost]) => state.refinedMinerals[mineral as MineralType] >= cost
    );
  };

  const getUpgradeCosts = (stat: string) => {
    return Object.entries(UPGRADE_COSTS[stat])
      .filter(([_, cost]) => cost > 0)
      .map(([mineral, cost]) => `${cost} ${mineral}`)
      .join(", ");
  };

  const upgradeShipStat = (stat: keyof typeof state.shipStats) => {
    if (!canAffordUpgrade(stat)) return;

    // Deduct costs
    Object.entries(UPGRADE_COSTS[stat]).forEach(([mineral, cost]) => {
      if (cost > 0) {
        dispatch({
          type: "REFINE_MINERAL",
          payload: {
            mineral: mineral as MineralType,
            amount: -cost,
          },
        });
      }
    });

    // Apply upgrade
    dispatch({
      type: "UPDATE_SHIP_STATS",
      payload: {
        [stat]:
          state.shipStats[stat] *
          UPGRADE_MULTIPLIERS[stat as keyof typeof UPGRADE_MULTIPLIERS],
      },
    });
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h2 className="text-lg font-bold mb-4">Ship Upgrades</h2>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(state.shipStats).map(([stat, value]) => (
          <div key={stat} className="bg-gray-50 rounded p-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm capitalize">
                {stat.replace(/([A-Z])/g, " $1").trim()}
              </span>
              <span className="text-sm font-medium">
                {Math.floor(value * 10) / 10}
              </span>
            </div>
            <button
              onClick={() =>
                upgradeShipStat(stat as keyof typeof state.shipStats)
              }
              disabled={!canAffordUpgrade(stat)}
              title={`Costs: ${getUpgradeCosts(stat)}`}
              className={`w-full px-2 py-1 text-xs rounded ${
                canAffordUpgrade(stat)
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Upgrade (+
              {Math.floor(
                (UPGRADE_MULTIPLIERS[stat as keyof typeof UPGRADE_MULTIPLIERS] -
                  1) *
                  100
              )}
              %)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
