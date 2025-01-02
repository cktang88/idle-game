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

export const INITIAL_SHIP_STATS = {
  miningCapacity: 100,
  defense: 100,
  evasion: 10,
  repairability: 10,
  stealth: 10,
};

export const BASE_MINING_TICK = 500; // 5 seconds
export const BASE_SHIP_BUILD_TIME = 10000; // 10 seconds
export const BASE_HIT_RATE = 0.3; // 30% chance to hit each ship
export const BASE_DAMAGE = 1.5; // Base damage per hit
export const MAX_DEFENSE = 100; // Maximum defense value
export const BASE_ALIEN_DANGER_INCREASE = 0.1; // Base increase per tick
export const JUNK_CHANCE = 0.4; // 40% chance to get junk per tick

export const MAX_ALIEN_DANGER = 100; // Maximum alien danger value
