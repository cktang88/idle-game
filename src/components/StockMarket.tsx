import { useGame } from "../contexts/GameContext";
import { useStockMarket } from "../hooks/useStockMarket";
import { MineralType } from "../types/game";
import { MINERALS } from "../constants/gameConstants";
import { useToast } from "./Toast";

export default function StockMarket() {
  const { state, dispatch } = useGame();
  const priceHistory = useStockMarket();
  const { showToast } = useToast();

  const sellMineral = (mineral: MineralType, amount: number) => {
    if (state.minerals[mineral] < amount) return;

    const totalValue = amount * priceHistory[mineral].current;
    dispatch({
      type: "SELL_MINERAL",
      payload: {
        mineral,
        amount,
        price: priceHistory[mineral].current,
      },
    });

    showToast(
      `Sold ${amount} ${mineral} for ${Math.floor(totalValue)} credits`,
      "success"
    );
  };

  return (
    <div className="game-card">
      <h2 className="text-lg font-bold mb-4">Market</h2>
      <div className="space-y-2">
        {MINERALS.map((mineral) => {
          const history = priceHistory[mineral.name];
          const priceChange = history.current - history.previous;
          const changePercent = (priceChange / history.previous) * 100;

          return (
            <div key={mineral.name} className="bg-gray-50 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{mineral.name}</span>
                  <span className="text-xs text-gray-500">
                    (Have: {Math.floor(state.minerals[mineral.name])})
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {history.current.toFixed(1)}
                    </span>
                    <span
                      className={`text-xs ${
                        priceChange > 0
                          ? "text-green-600"
                          : priceChange < 0
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {priceChange > 0 ? "↑" : priceChange < 0 ? "↓" : "→"}
                      {Math.abs(changePercent).toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    Avg: {history.average.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => sellMineral(mineral.name, 10)}
                  disabled={state.minerals[mineral.name] < 10}
                  title={`Sell 10 for ${Math.floor(
                    history.current * 10
                  )} credits`}
                  className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Sell 10
                </button>
                <button
                  onClick={() => sellMineral(mineral.name, 100)}
                  disabled={state.minerals[mineral.name] < 100}
                  title={`Sell 100 for ${Math.floor(
                    history.current * 100
                  )} credits`}
                  className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Sell 100
                </button>
                <button
                  onClick={() =>
                    sellMineral(mineral.name, state.minerals[mineral.name])
                  }
                  disabled={state.minerals[mineral.name] === 0}
                  title={`Sell ${Math.floor(
                    state.minerals[mineral.name]
                  )} for ${Math.floor(
                    history.current * state.minerals[mineral.name]
                  )} credits`}
                  className="px-2 py-1 text-xs bg-green-700 text-white rounded hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Sell All
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
