import { AbilityName } from './abilities/AbilityName';

/**
 * "Class" in the sense of, like, a D&D class
 */
export interface PlayerUnitClass {
  readonly lifePerLevel: number;
  readonly manaPerLevel: number;
  readonly strengthPerLevel: number;
  readonly maxLevel: number;
  getAllPossibleLearnableAbilities: () => AbilityName[];
  getAbilityDependencies: (ability: AbilityName) => AbilityName[];
  getCumulativeKillsToNextLevel: (currentLevel: number) => number | null;
}

const learnableAbilities = [
  AbilityName.BLINK,
  AbilityName.CLEAVE,
  AbilityName.DASH_ATTACK,
  AbilityName.HEAVY_ATTACK,
  AbilityName.KNOCKBACK_ATTACK,
  AbilityName.PIERCE,
  AbilityName.SCORPION,
  AbilityName.SHOOT_FIREBALL,
  AbilityName.STRAFE_SHOT,
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
  getAllPossibleLearnableAbilities = (): AbilityName[] => learnableAbilities;
  getAbilityDependencies = (ability: AbilityName): AbilityName[] => {
    switch (ability) {
      case AbilityName.CLEAVE:
        return [AbilityName.HEAVY_ATTACK];
      case AbilityName.PIERCE:
        return [AbilityName.KNOCKBACK_ATTACK];
      case AbilityName.DASH_ATTACK:
        return [AbilityName.KNOCKBACK_ATTACK];
      default:
        return [];
    }
  };
  getCumulativeKillsToNextLevel = (currentLevel: number): number | null => {
    return cumulativeKillsToNextLevel[currentLevel - 1] ?? null;
  };
}

export const PlayerUnitClass = {
  DEFAULT: new DefaultClass()
};
