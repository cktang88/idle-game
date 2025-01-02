import { useState, useEffect } from "react";
import { MineralType } from "../types/game";
import { MINERALS } from "../constants/gameConstants";

const PRICE_UPDATE_INTERVAL = 5000; // 5 seconds
const VOLATILITY = 0.1; // 10% price movement

interface PriceHistory {
  current: number;
  previous: number;
  average: number;
  totalSamples: number;
}

export function useStockMarket() {
  const [priceHistory, setPriceHistory] = useState<
    Record<MineralType, PriceHistory>
  >(
    () =>
      Object.fromEntries(
        MINERALS.map((m) => [
          m.name,
          {
            current: m.baseValue,
            previous: m.baseValue,
            average: m.baseValue,
            totalSamples: 1,
          },
        ])
      ) as Record<MineralType, PriceHistory>
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPriceHistory((current) => {
        const newHistory = { ...current };

        MINERALS.forEach((mineral) => {
          const history = current[mineral.name];
          const targetPrice = mineral.baseValue;
          const randomWalk =
            (Math.random() - 0.5) * 2 * VOLATILITY * history.current;
          const meanReversion = (targetPrice - history.current) * 0.1;

          const newPrice = Math.max(
            history.current + randomWalk + meanReversion,
            mineral.baseValue * 0.1
          );

          newHistory[mineral.name] = {
            current: newPrice,
            previous: history.current,
            average:
              (history.average * history.totalSamples + newPrice) /
              (history.totalSamples + 1),
            totalSamples: history.totalSamples + 1,
          };
        });

        return newHistory;
      });
    }, PRICE_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return priceHistory;
}
