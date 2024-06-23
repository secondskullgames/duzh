import Unit from './Unit';
import { AbilityName } from '@main/abilities/AbilityName';
import { Key, NumberKey } from '@lib/input/inputTypes';
import { UnitAbility } from '@main/abilities/UnitAbility';

/**
 * "Class" in the sense of, like, a D&D class
 */
export interface PlayerUnitClass {
  readonly lifePerLevel: number;
  readonly manaPerLevel: number;
  readonly strengthPerLevel: number;
  readonly maxLevel: number;
  getCumulativeKillsToNextLevel: (currentLevel: number) => number | null;
  getHotkeyForAbility: (ability: UnitAbility, unit: Unit) => string | null;
  getAbilityForHotkey: (hotkey: Key, unit: Unit) => UnitAbility | null;
  // if LEVEL_UP_SCREEN=false...
  getAbilitiesLearnedAtLevel: (levelNumber: number) => AbilityName[];
  // if LEVEL_UP_SCREEN=true...
  getAllPossibleLearnableAbilities: () => AbilityName[];
  getAbilityDependencies: (ability: AbilityName) => AbilityName[];
}

const abilitiesLearnedAtLevel: Record<number, AbilityName[]> = {
  2: [AbilityName.HEAVY_ATTACK],
  3: [AbilityName.KNOCKBACK_ATTACK],
  4: [AbilityName.STUN_ATTACK],
  5: [AbilityName.DASH_ATTACK]
};

const learnableAbilities = [
  AbilityName.BLINK,
  AbilityName.CLEAVE,
  AbilityName.DASH_ATTACK,
  //AbilityName.SHOOT_FIREBALL,
  AbilityName.HEAVY_ATTACK,
  AbilityName.KNOCKBACK_ATTACK,
  AbilityName.PIERCE,
  AbilityName.SCORPION,
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
  getHotkeyForAbility = (ability: UnitAbility, unit: Unit): string | null => {
    switch (ability.name) {
      case AbilityName.DASH:
      case AbilityName.SHOOT_ARROW:
      case AbilityName.SHOOT_FIREBOLT:
      case AbilityName.SHOOT_FROSTBOLT:
        return ' ';
      default: {
        const index = unit
          .getAbilities()
          .filter(ability => !ability.innate)
          .indexOf(ability);
        if (index === -1) {
          return null;
        }
        return (index + 1).toString() as NumberKey;
      }
    }
  };
  getAbilityForHotkey = (hotkey: Key, unit: Unit): UnitAbility | null => {
    if (hotkey.match(/^\d$/)) {
      const index = parseInt(hotkey);
      return unit.getAbilities().filter(ability => !ability.innate)[index - 1];
    } else {
      return null;
    }
  };
  getAbilitiesLearnedAtLevel = (levelNumber: number): AbilityName[] => {
    return abilitiesLearnedAtLevel[levelNumber] ?? [];
  };
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
