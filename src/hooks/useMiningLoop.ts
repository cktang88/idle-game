import { useEffect, useCallback } from "react";
import { useGame } from "../contexts/GameContext";
import { MineralType } from "../types/game";
import {
  MINERALS,
  BASE_MINING_TICK,
  BASE_ALIEN_DANGER_INCREASE,
} from "../constants/gameConstants";
import { useToast } from "../components/Toast";

export function useMiningLoop() {
  const { state, dispatch } = useGame();
  const { showToast } = useToast();

  const formatMiningResults = (
    minerals: Partial<Record<MineralType, number>>,
    junkCollected: number
  ) => {
    const results = Object.entries(minerals)
      .map(([mineral, amount]) => `${mineral}: ${amount}`)
      .join(", ");
    const junkText = junkCollected > 0 ? `Junk: ${junkCollected}` : "";
    return results.length > 0 ? `Mining results: ${results}` : junkText;
  };

  const rollForMinerals = useCallback(
    (count: number) => {
      const minerals: Partial<Record<MineralType, number>> = {};

      // Roll for minerals
      MINERALS.forEach((mineral) => {
        const successfulMines = Array(count)
          .fill(0)
          .filter(() => Math.random() < mineral.chance).length;

        if (successfulMines > 0) {
          minerals[mineral.name] = Math.floor(
            successfulMines * Math.random() * state.shipStats.miningCapacity
          );
        }
      });

      // If no minerals were found, collect junk instead
      const junkCollected =
        Object.keys(minerals).length === 0
          ? Math.floor(Math.random() * state.shipStats.miningCapacity * count)
          : 0;

      return { minerals, junkCollected };
    },
    [state.shipStats.miningCapacity]
  );

  const processAlienAttacks = useCallback(
    (count: number) => {
      const baseAttackChance = state.alienDanger / 100;
      const modifiedChance =
        baseAttackChance * (1 - state.shipStats.stealth / 100);

      const attackedShips = Array(count)
        .fill(0)
        .filter(() => Math.random() < modifiedChance).length;

      if (attackedShips === 0) return null;

      const survivedShips =
        attackedShips -
        Array(attackedShips)
          .fill(0)
          .filter(() => Math.random() < state.shipStats.evasion / 100).length;

      const repairedShips = Math.floor(
        survivedShips * (state.shipStats.repairability / 100)
      );

      return {
        destroyed: survivedShips - repairedShips,
        repairing: repairedShips,
      };
    },
    [state.alienDanger, state.shipStats]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      // Process mining ships
      if (state.ships.mining > 0) {
        const attackResult = processAlienAttacks(state.ships.mining);

        if (attackResult) {
          const remainingMiners =
            state.ships.mining -
            (attackResult.destroyed + attackResult.repairing);

          dispatch({
            type: "UPDATE_SHIP_COUNTS",
            payload: {
              mining: remainingMiners,
              repairing: state.ships.repairing + attackResult.repairing,
            },
          });

          if (remainingMiners > 0) {
            const { minerals: minedMinerals, junkCollected } =
              rollForMinerals(remainingMiners);
            if (Object.keys(minedMinerals).length > 0) {
              dispatch({ type: "ADD_MINERALS", payload: minedMinerals });
            }
            if (junkCollected > 0) {
              dispatch({ type: "PROCESS_MINING_TICK" });
            }
            showToast(
              formatMiningResults(minedMinerals, junkCollected),
              "success"
            );
          }
        } else {
          const { minerals: minedMinerals, junkCollected } = rollForMinerals(
            state.ships.mining
          );
          if (Object.keys(minedMinerals).length > 0) {
            dispatch({ type: "ADD_MINERALS", payload: minedMinerals });
          }
          if (junkCollected > 0) {
            dispatch({ type: "PROCESS_MINING_TICK" });
          }
          showToast(
            formatMiningResults(minedMinerals, junkCollected),
            "success"
          );
        }

        // Move ships to returning state
        dispatch({
          type: "UPDATE_SHIP_COUNTS",
          payload: {
            mining: 0,
            returning: state.ships.mining,
          },
        });
      }

      // Process returning ships
      if (state.ships.returning > 0) {
        dispatch({
          type: "UPDATE_SHIP_COUNTS",
          payload: {
            returning: 0,
            idle: state.ships.idle + state.ships.returning,
          },
        });
      }

      // Process repairing ships
      if (state.ships.repairing > 0) {
        const repairedCount = Math.ceil(
          (state.ships.repairing * state.baseStats.healing) / 10
        );
        dispatch({
          type: "UPDATE_SHIP_COUNTS",
          payload: {
            repairing: state.ships.repairing - repairedCount,
            idle: state.ships.idle + repairedCount,
          },
        });
      }

      // Update alien danger
      if (state.ships.mining > 0) {
        dispatch({
          type: "UPDATE_ALIEN_DANGER",
          payload:
            BASE_ALIEN_DANGER_INCREASE *
            state.ships.mining *
            (1 - state.shipStats.stealth / 200),
        });
      }
    }, BASE_MINING_TICK / state.baseStats.shipProduction);

    return () => clearInterval(interval);
  }, [state, dispatch, rollForMinerals, processAlienAttacks]);
}
