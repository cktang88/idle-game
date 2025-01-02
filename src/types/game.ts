export type MineralType =
  | "Ferrox"
  | "Silicor"
  | "Ionite"
  | "Tritum Spark"
  | "Celestium"
  | "Crystite"
  | "Xotheneium";

export interface MineralInfo {
  name: MineralType;
  rarity: "common" | "uncommon" | "rare" | "very rare" | "extremely rare";
  chance: number;
  baseValue: number;
}

export type ShipStatus =
  | "idle"
  | "mining"
  | "returning"
  | "repairing"
  | "building";

export interface ShipStats {
  miningCapacity: number;
  defense: number;
  evasion: number;
  speed: number;
  repairability: number;
  stealth: number;
}

export interface GameState {
  ships: Record<ShipStatus, number>;
  shipStats: ShipStats;
  minerals: Record<MineralType, number>;
  refinedMinerals: Record<MineralType, number>;
  baseStats: {
    shipProduction: number;
    healing: number;
    refiningSpeed: number;
  };
  alienDanger: number;
  credits: number;
}
