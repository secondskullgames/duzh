import { AbilityName } from './abilities/AbilityName';

/**
 * "Class" in the sense of, like, a D&D class
 */
export interface PlayerUnitClass {
  readonly lifePerLevel: number;
  readonly manaPerLevel: number;
  readonly strengthPerLevel: number;
  readonly maxLevel: number;
  getLearnableAbilities: () => AbilityName[];
  getCumulativeKillsToNextLevel: (currentLevel: number) => number | null;
}

const learnableAbilities = [
  AbilityName.BLINK,
  AbilityName.DASH,
  AbilityName.DASH_ATTACK,
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
  readonly lifePerLevel = 0;
  readonly manaPerLevel = 2;
  readonly strengthPerLevel = 0;
  readonly maxLevel = 10;
  getLearnableAbilities = (): AbilityName[] => learnableAbilities;
  getCumulativeKillsToNextLevel = (currentLevel: number): number | null => {
    return cumulativeKillsToNextLevel[currentLevel - 1] ?? null;
  };
}

export const PlayerUnitClass = {
  DEFAULT: new DefaultClass()
};
