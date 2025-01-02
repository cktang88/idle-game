import { useGame } from "../contexts/GameContext";
import { MineralType } from "../types/game";
import { useToast } from "../components/Toast";
import { BASE_MINING_TICK } from "../constants/gameConstants";

const UPGRADE_COSTS: Record<string, Record<MineralType, number>> = {
  shipProduction: {
    Ferrox: 100,
    Silicor: 100,
    Ionite: 0,
    "Tritum Spark": 0,
    Celestium: 0,
    Crystite: 0,
    Xotheneium: 0,
  },
  healing: {
    Ferrox: 0,
    Silicor: 0,
    Ionite: 50,
    "Tritum Spark": 50,
    Celestium: 0,
    Crystite: 0,
    Xotheneium: 0,
  },
  refiningSpeed: {
    Ferrox: 0,
    Silicor: 0,
    Ionite: 0,
    "Tritum Spark": 0,
    Celestium: 25,
    Crystite: 25,
    Xotheneium: 0,
  },
};

const UPGRADE_DESCRIPTIONS = {
  shipProduction: (level: number) => ({
    name: "Ship Production",
    description: "Decreases the time between mining operations",
    current: `${(BASE_MINING_TICK / level / 1000).toFixed(1)}s per operation`,
  }),
  healing: (level: number) => ({
    name: "Healing",
    description: "Increases repair speed of damaged ships",
    current: `${Math.floor(level * 10)}% ships repaired per tick`,
  }),
  refiningSpeed: (level: number) => ({
    name: "Refining Speed",
    description: "Increases the speed of mineral refinement",
    current: `${Math.floor(level * 100)}% refining speed`,
  }),
};

export default function BaseUpgrades() {
  const { state, dispatch } = useGame();
  const { showToast } = useToast();

  const canAffordUpgrade = (upgradeName: string) => {
    const costs = UPGRADE_COSTS[upgradeName];
    return Object.entries(costs).every(
      ([mineral, cost]) => state.refinedMinerals[mineral as MineralType] >= cost
    );
  };

  const getUpgradeCosts = (stat: string) => {
    return Object.entries(UPGRADE_COSTS[stat])
      .filter(([, cost]) => cost > 0)
      .map(([mineral, cost]) => `${cost} ${mineral}`)
      .join(", ");
  };

  const purchaseUpgrade = (upgradeName: keyof typeof state.baseStats) => {
    if (!canAffordUpgrade(upgradeName)) return;

    Object.entries(UPGRADE_COSTS[upgradeName]).forEach(([mineral, cost]) => {
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

    const newValue = state.baseStats[upgradeName] * 1.1;
    dispatch({
      type: "UPGRADE_BASE",
      payload: {
        stat: upgradeName,
        value: newValue,
      },
    });

    const info = UPGRADE_DESCRIPTIONS[upgradeName](newValue);
    showToast(`Upgraded ${info.name} to ${info.current}`, "success");
  };

  return (
    <div className="game-card">
      <h2 className="text-lg font-bold mb-4">Base Upgrades</h2>
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(state.baseStats).map(([stat, level]) => {
          const info =
            UPGRADE_DESCRIPTIONS[stat as keyof typeof UPGRADE_DESCRIPTIONS](
              level
            );
          return (
            <div key={stat} className="bg-gray-50 rounded p-3">
              <div className="flex flex-col gap-1 mb-2">
                <span className="text-sm font-medium">{info.name}</span>
                <span className="text-xs text-gray-600">
                  {info.description}
                </span>
                <span className="text-xs text-blue-600 font-medium">
                  {info.current}
                </span>
              </div>
              <button
                onClick={() =>
                  purchaseUpgrade(stat as keyof typeof state.baseStats)
                }
                disabled={!canAffordUpgrade(stat)}
                title={`Costs: ${getUpgradeCosts(stat)}`}
                className={`w-full px-2 py-1.5 text-xs rounded ${
                  canAffordUpgrade(stat)
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                } transition-colors`}
              >
                Upgrade (+10%)
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
