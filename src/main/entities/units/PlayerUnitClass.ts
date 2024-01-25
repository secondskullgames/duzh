import { AbilityName } from './abilities/AbilityName';

/**
 * "Class" in the sense of, like, a D&D class
 */
export interface PlayerUnitClass {
  getLearnableAbilities: () => AbilityName[];
  getCumulativeKillsToNextLevel: (currentLevel: number) => number | null;
  getMaxLevel: () => number;
}

const learnableAbilities = [
  AbilityName.BLINK,
  AbilityName.DASH,
  AbilityName.HEAVY_ATTACK,
  AbilityName.KNOCKBACK_ATTACK,
  AbilityName.SHOOT_FIREBALL,
  AbilityName.STUN_ATTACK
];

const cumulativeKillsToNextLevel = [
  4, // 4,
  10, // 6,
  18, // 8,
  28, // 10,
  40, // 12,
  54, // 14,
  70, // 16,
  88, // 18,
  108 // 20
];

class DefaultClass implements PlayerUnitClass {
  getLearnableAbilities = (): AbilityName[] => learnableAbilities;
  getCumulativeKillsToNextLevel = (currentLevel: number): number | null => {
    return cumulativeKillsToNextLevel[currentLevel - 1] ?? null;
  };
  getMaxLevel = (): number => 10;
}

export const PlayerUnitClass = {
  DEFAULT: new DefaultClass()
};
