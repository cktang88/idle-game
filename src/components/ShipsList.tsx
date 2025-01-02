import { useGame } from "../contexts/GameContext";
import { Ship } from "../types/game";
import { useMiningLoop } from "../hooks/useMiningLoop";

export default function ShipsList() {
  const { state, dispatch } = useGame();
  useMiningLoop();

  const addShip = () => {
    dispatch({ type: "ADD_SHIP" });
  };

  const sendShipMining = (ship: Ship) => {
    if (ship.status === "idle") {
      dispatch({
        type: "UPDATE_SHIP",
        payload: { ...ship, status: "mining" },
      });
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Ships</h2>
        <button
          onClick={addShip}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Ship
        </button>
      </div>

      <div className="space-y-4">
        {state.ships.map((ship) => (
          <ShipCard
            key={ship.id}
            ship={ship}
            onMine={() => sendShipMining(ship)}
          />
        ))}
      </div>
    </div>
  );
}

function ShipCard({ ship, onMine }: { ship: Ship; onMine: () => void }) {
  return (
    <div className="border rounded p-3 space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-semibold">Ship #{ship.id.slice(0, 4)}</span>
        <span
          className={`px-2 py-1 rounded text-sm ${
            ship.status === "mining"
              ? "bg-green-100 text-green-800"
              : ship.status === "returning"
              ? "bg-blue-100 text-blue-800"
              : ship.status === "destroyed"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {ship.status}
        </span>
      </div>

      <div className="flex justify-between text-sm">
        <span>Health</span>
        <span>{ship.health}%</span>
      </div>

      <div className="space-y-1">
        <div className="text-sm font-medium">Stats</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(ship.stats).map(([stat, value]) => (
            <div key={stat} className="flex justify-between">
              <span>{stat}:</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {ship.status === "idle" && (
        <button
          onClick={onMine}
          className="w-full mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Send Mining
        </button>
      )}
    </div>
  );
}
