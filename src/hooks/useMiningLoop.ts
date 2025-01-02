import { useEffect, useCallback } from "react";
import { useGame } from "../contexts/GameContext";
import { MineralType } from "../types/game";
import {
  MINERALS,
  BASE_MINING_TICK,
  BASE_ALIEN_DANGER_INCREASE,
  BASE_HIT_RATE,
  MAX_ALIEN_DANGER,
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

  // Mining loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Process mining ships
      if (state.ships.mining > 0) {
        // Update alien danger
        const dangerIncrease =
          BASE_ALIEN_DANGER_INCREASE *
          state.ships.mining *
          (1 - state.shipStats.stealth / 100);
        dispatch({
          type: "UPDATE_ALIEN_DANGER",
          payload: dangerIncrease,
        });

        // Show alien danger warning
        if (state.alienDanger >= 75) {
          showToast(
            `⚠️ High Alien Activity Detected! (${Math.floor(
              state.alienDanger
            )}%)`,
            "warning"
          );
        }

        // Process alien attacks if danger reaches threshold
        if (state.alienDanger >= MAX_ALIEN_DANGER) {
          const shipsHit = Math.floor(
            state.ships.mining *
              (1 - state.shipStats.evasion / 100) *
              BASE_HIT_RATE
          );

          if (shipsHit > 0) {
            dispatch({
              type: "UPDATE_SHIP_COUNTS",
              payload: {
                mining: state.ships.mining - shipsHit,
                repairing: state.ships.repairing + shipsHit,
              },
            });
            showToast(
              `⚠️ ${shipsHit} ships damaged and need repairs`,
              "warning"
            );
          }
        }

        // Roll for minerals and show results
        const { minerals: minedMinerals, junkCollected } = rollForMinerals(
          state.ships.mining
        );
        if (Object.keys(minedMinerals).length > 0) {
          dispatch({ type: "ADD_MINERALS", payload: minedMinerals });
        }
        showToast(formatMiningResults(minedMinerals, junkCollected), "success");
      }
    }, BASE_MINING_TICK / state.baseStats.shipProduction);

    return () => clearInterval(interval);
  }, [
    state.ships.mining,
    state.ships.repairing,
    state.alienDanger,
    state.shipStats.stealth,
    state.shipStats.evasion,
    state.baseStats.shipProduction,
    dispatch,
    rollForMinerals,
    showToast,
  ]);

  // Repair loop
  useEffect(() => {
    if (state.ships.repairing === 0) {
      if (state.repairProgress !== 0) {
        dispatch({ type: "UPDATE_REPAIR_PROGRESS", payload: 0 });
      }
      return;
    }

    const interval = setInterval(() => {
      // Calculate repair progress increment based on healing stat
      const progressIncrement = (state.baseStats.healing / 10) * 100;
      const newProgress = Math.min(
        100,
        state.repairProgress + progressIncrement
      );
      dispatch({ type: "UPDATE_REPAIR_PROGRESS", payload: newProgress });
    }, BASE_MINING_TICK);

    return () => clearInterval(interval);
  }, [
    state.ships.repairing,
    state.repairProgress,
    state.baseStats.healing,
    dispatch,
  ]);
}
