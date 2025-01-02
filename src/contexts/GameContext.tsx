import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import { GameState, MineralType, ShipStatus, ShipStats } from "../types/game";
import {
  MINERALS,
  INITIAL_SHIP_STATS,
  BASE_MINING_TICK,
  BASE_ALIEN_DANGER_INCREASE,
  MAX_ALIEN_DANGER,
  BASE_HIT_RATE,
  BASE_DAMAGE,
  MAX_DEFENSE,
  JUNK_CHANCE,
} from "../constants/gameConstants";
import { useToast } from "../components/Toast";

type GameAction =
  | { type: "START_BUILDING_SHIP" }
  | { type: "UPDATE_SHIP_COUNTS"; payload: Partial<Record<ShipStatus, number>> }
  | { type: "UPDATE_SHIP_STATS"; payload: Partial<ShipStats> }
  | { type: "ADD_MINERALS"; payload: Partial<Record<MineralType, number>> }
  | {
      type: "REFINE_MINERAL";
      payload: { mineral: MineralType; amount: number };
    }
  | { type: "UPDATE_ALIEN_DANGER"; payload: number }
  | {
      type: "UPGRADE_BASE";
      payload: {
        stat: keyof GameState["baseStats"];
        value: number;
      };
    }
  | {
      type: "SELL_MINERAL";
      payload: {
        mineral: MineralType;
        amount: number;
        price: number;
      };
    }
  | { type: "ADD_CREDITS"; payload: number }
  | { type: "PROCESS_MINING_TICK" }
  | { type: "UPDATE_REPAIR_PROGRESS"; payload: number }
  | { type: "UPDATE_BUILD_PROGRESS"; payload: number };

const initialState: GameState = {
  ships: {
    building: 0,
    idle: 1,
    mining: 0,
    repairing: 0,
  },
  shipStats: INITIAL_SHIP_STATS,
  minerals: Object.fromEntries(MINERALS.map((m) => [m.name, 0])) as Record<
    MineralType,
    number
  >,
  refinedMinerals: Object.fromEntries(
    MINERALS.map((m) => [m.name, 0])
  ) as Record<MineralType, number>,
  baseStats: {
    shipProduction: 1,
    healing: 1,
    refiningSpeed: 1,
  },
  alienDanger: 0,
  credits: 0,
  repairProgress: 0,
  buildProgress: 0,
};

function gameReducer(
  state: GameState,
  action: GameAction,
  showToast?: (message: string, type: "success" | "warning" | "error") => void
): GameState {
  switch (action.type) {
    case "START_BUILDING_SHIP": {
      if (state.credits < 100 || state.ships.building > 0) return state;
      return {
        ...state,
        ships: {
          ...state.ships,
          building: state.ships.building + 1,
        },
        credits: state.credits - 100,
        buildProgress: 0,
      };
    }

    case "UPDATE_SHIP_COUNTS": {
      return {
        ...state,
        ships: {
          ...state.ships,
          ...action.payload,
        },
      };
    }

    case "UPDATE_SHIP_STATS": {
      return {
        ...state,
        shipStats: {
          ...state.shipStats,
          ...action.payload,
        },
      };
    }

    case "ADD_MINERALS":
      return {
        ...state,
        minerals: Object.entries(action.payload).reduce(
          (acc, [mineral, amount]) => ({
            ...acc,
            [mineral]:
              (state.minerals[mineral as MineralType] || 0) + (amount || 0),
          }),
          { ...state.minerals }
        ),
      };
    case "REFINE_MINERAL": {
      const { mineral, amount } = action.payload;
      if (state.minerals[mineral] < amount) return state;

      return {
        ...state,
        minerals: {
          ...state.minerals,
          [mineral]: state.minerals[mineral] - amount,
        },
        refinedMinerals: {
          ...state.refinedMinerals,
          [mineral]: state.refinedMinerals[mineral] + amount,
        },
      };
    }
    case "UPDATE_ALIEN_DANGER":
      return {
        ...state,
        alienDanger: Math.min(
          Math.max(0, state.alienDanger + action.payload),
          MAX_ALIEN_DANGER
        ),
      };
    case "UPGRADE_BASE": {
      const { stat, value } = action.payload;
      return {
        ...state,
        baseStats: {
          ...state.baseStats,
          [stat]: value,
        },
      };
    }
    case "SELL_MINERAL": {
      const { mineral, amount, price } = action.payload;
      if (state.minerals[mineral] < amount) return state;

      return {
        ...state,
        minerals: {
          ...state.minerals,
          [mineral]: state.minerals[mineral] - amount,
        },
        credits: state.credits + amount * price,
      };
    }
    case "ADD_CREDITS": {
      return {
        ...state,
        credits: state.credits + action.payload,
      };
    }
    case "UPDATE_REPAIR_PROGRESS": {
      const newProgress = action.payload;
      if (newProgress >= 100 && state.ships.repairing > 0) {
        // Move one ship from repairing to idle
        return {
          ...state,
          ships: {
            ...state.ships,
            repairing: state.ships.repairing - 1,
            idle: state.ships.idle + 1,
          },
          repairProgress: 0, // Reset progress for next ship
        };
      }
      return {
        ...state,
        repairProgress: newProgress,
      };
    }
    case "PROCESS_MINING_TICK": {
      if (!showToast) return state;

      const { ships, shipStats } = state;
      const newState = { ...state };
      const mineralGains: Record<string, number> = {};

      // Process mining results
      if (ships.mining > 0) {
        // Roll for minerals (each mineral has independent chance)
        MINERALS.forEach((mineral) => {
          const rolls = ships.mining; // Roll for each mining ship
          const successes = Array(rolls)
            .fill(0)
            .filter(() => Math.random() < mineral.chance).length;

          if (successes > 0) {
            const amount = Math.ceil(
              (successes * shipStats.miningCapacity) /
                INITIAL_SHIP_STATS.miningCapacity
            );
            newState.minerals[mineral.name] =
              (newState.minerals[mineral.name] || 0) + amount;
            mineralGains[mineral.name] = amount;
          }
        });

        // Calculate junk (for ships that didn't find minerals)
        const successfulShips = Object.values(mineralGains).reduce(
          (total, amount) =>
            total + Math.ceil(amount / shipStats.miningCapacity),
          0
        );
        const junkShips = Math.max(0, ships.mining - successfulShips);
        if (junkShips > 0 && Math.random() < JUNK_CHANCE) {
          newState.minerals.Junk = (newState.minerals.Junk || 0) + junkShips;
          mineralGains.Junk = junkShips;
        }

        // Update alien danger (only affected by mining ships)
        const dangerIncrease =
          BASE_ALIEN_DANGER_INCREASE *
          ships.mining *
          (1 - shipStats.stealth / 100);
        newState.alienDanger = Math.min(
          MAX_ALIEN_DANGER,
          state.alienDanger + dangerIncrease
        );

        // Show alien danger warning if high but not at max
        if (
          newState.alienDanger >= 75 &&
          newState.alienDanger < MAX_ALIEN_DANGER
        ) {
          showToast(
            `⚠️ High Alien Activity Detected! (${Math.floor(
              newState.alienDanger
            )}%)`,
            "warning"
          );
        }

        // Process alien attacks if danger reaches threshold
        if (newState.alienDanger >= MAX_ALIEN_DANGER) {
          const shipsHit = Math.floor(
            ships.mining * (1 - shipStats.evasion / 100) * BASE_HIT_RATE
          );

          if (shipsHit > 0) {
            // TODO: actually use damage and defense in calculating ships to move to repair...
            const damage = (1 - shipStats.defense / MAX_DEFENSE) * BASE_DAMAGE;
            // Move hit ships to repairing
            newState.ships = {
              ...newState.ships,
              mining: newState.ships.mining - shipsHit,
              repairing: newState.ships.repairing + shipsHit,
            };

            // Show damage notification
            if (damage >= 1) {
              showToast(`🚨 ${shipsHit} ships destroyed by aliens!`, "error");
            } else {
              showToast(
                `⚠️ ${shipsHit} ships damaged and need repairs`,
                "warning"
              );
            }
          }

          // Reset danger after attack
          newState.alienDanger = 0;
        }

        // Store mining results in state for toast notifications
        newState.lastMiningResults = mineralGains;
      }

      return newState;
    }
    case "UPDATE_BUILD_PROGRESS": {
      const newProgress = action.payload;
      if (newProgress >= 100 && state.ships.building > 0) {
        // Move one ship from building to idle
        return {
          ...state,
          ships: {
            ...state.ships,
            building: state.ships.building - 1,
            idle: state.ships.idle + 1,
          },
          buildProgress: 0, // Reset progress for next ship
        };
      }
      return {
        ...state,
        buildProgress: newProgress,
      };
    }
    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [state, dispatch] = useReducer(
    (state: GameState, action: GameAction) =>
      gameReducer(state, action, showToast),
    initialState
  );

  // Process mining ticks
  useEffect(() => {
    if (state.ships.mining === 0) return;

    const interval = setInterval(() => {
      dispatch({ type: "PROCESS_MINING_TICK" });
    }, BASE_MINING_TICK);

    return () => clearInterval(interval);
  }, [state.ships.mining]);

  // Track mining results and show toasts
  useEffect(() => {
    if (!state.lastMiningResults) return;

    // Show mining results toast
    if (Object.keys(state.lastMiningResults).length > 0) {
      const results = Object.entries(state.lastMiningResults)
        .map(([mineral, amount]) => `${amount} ${mineral}`)
        .join(", ");

      showToast(`Mining Results: ${results}`, "success");
    }
  }, [state.lastMiningResults]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
