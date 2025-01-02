import { MineralInfo } from "../types/game";

export const MINERALS: MineralInfo[] = [
  { name: "Ferrox", rarity: "common", chance: 0.1, baseValue: 10 },
  { name: "Silicor", rarity: "common", chance: 0.1, baseValue: 12 },
  { name: "Ionite", rarity: "uncommon", chance: 0.05, baseValue: 25 },
  { name: "Tritum Spark", rarity: "uncommon", chance: 0.05, baseValue: 30 },
  { name: "Celestium", rarity: "rare", chance: 0.02, baseValue: 50 },
  { name: "Crystite", rarity: "rare", chance: 0.02, baseValue: 55 },
  {
    name: "Xotheneium",
    rarity: "extremely rare",
    chance: 0.001,
    baseValue: 200,
  },
];

export const JUNK_CHANCE = 1; // 100% chance to get junk when a ship fails to find minerals

export const INITIAL_SHIP_STATS = {
  miningCapacity: 100,
  defense: 100,
  evasion: 10,
  repairability: 10,
  stealth: 10,
};

export const BASE_MINING_TICK = 5000; // 5 seconds
export const BASE_SHIP_BUILD_TIME = 40000; // 40 seconds
export const BASE_SHIP_REPAIR_TIME = 20000; // 20 seconds
export const BASE_HIT_RATE = 0.3; // 30% chance to hit each ship
export const BASE_DAMAGE = 1.5; // Base damage per hit
export const MAX_DEFENSE = 100; // Maximum defense value
export const BASE_ALIEN_DANGER_INCREASE = 0.5; // Base increase per tick

export const MAX_ALIEN_DANGER = 100; // Maximum alien danger value
