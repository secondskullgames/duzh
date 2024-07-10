import Unit from './Unit';
import { AbilityName } from '@main/abilities/AbilityName';
import { Key, NumberKey } from '@lib/input/inputTypes';
import { UnitAbility } from '@main/abilities/UnitAbility';
import { AbilityFactory } from '@main/abilities/AbilityFactory';
import { injectable } from 'inversify';

/**
 * "Class" in the sense of, like, a D&D class
 */
export interface PlayerUnitClass {
  readonly lifePerLevel: number;
  readonly manaPerLevel: number;
  readonly meleeDamagePerLevel: number;
  readonly maxLevel: number;
  getCumulativeKillsToNextLevel: (currentLevel: number) => number | null;
  getHotkeyForAbility: (ability: UnitAbility, unit: Unit) => string | null;
  getAbilityForHotkey: (hotkey: Key, unit: Unit) => UnitAbility | null;
  getNumberedAbilities: (unit: Unit) => UnitAbility[];
  getRightAlignedAbilities: (unit: Unit) => UnitAbility[];
  getAbilitiesLearnedAtLevel: (levelNumber: number) => AbilityName[];
}

export const PlayerUnitClass = Symbol('PlayerUnitClass');

const abilitiesLearnedAtLevel: Record<number, AbilityName[]> = {
  2: [AbilityName.HEAVY_ATTACK],
  3: [AbilityName.KNOCKBACK_ATTACK],
  4: [AbilityName.STUN_ATTACK],
  5: [AbilityName.DASH_ATTACK],
  6: [AbilityName.CLEAVE]
};

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

@injectable()
export class PlayerUnitClassImpl implements PlayerUnitClass {
  readonly lifePerLevel = 0;
  readonly manaPerLevel = 2;
  readonly meleeDamagePerLevel = 0;
  readonly maxLevel = 10;

  constructor(private readonly abilityFactory: AbilityFactory) {}

  getHotkeyForAbility = (ability: UnitAbility, unit: Unit): string | null => {
    switch (ability.name) {
      case AbilityName.DASH:
      case AbilityName.SHOOT_ARROW:
      case AbilityName.SHOOT_FIREBOLT:
      case AbilityName.SHOOT_FROSTBOLT:
        return null;
      default: {
        const index = unit
          .getAbilities()
          .map(this.abilityFactory.abilityForName)
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
      return unit
        .getAbilities()
        .map(this.abilityFactory.abilityForName)
        .filter(ability => !ability.innate)[index - 1];
    } else if (hotkey === 'ALT') {
      return (
        unit
          .getAbilities()
          .map(this.abilityFactory.abilityForName)
          .find(ability => ability.name === AbilityName.DASH) ?? null
      );
    } else {
      return null;
    }
  };

  getNumberedAbilities = (unit: Unit): UnitAbility[] => {
    return unit
      .getAbilities()
      .map(this.abilityFactory.abilityForName)
      .filter(ability => !ability.innate);
  };

  getRightAlignedAbilities = (unit: Unit): UnitAbility[] => {
    return unit
      .getAbilities()
      .map(this.abilityFactory.abilityForName)
      .filter(ability => ability.innate && ability.icon);
  };

  getAbilitiesLearnedAtLevel = (levelNumber: number): AbilityName[] => {
    return abilitiesLearnedAtLevel[levelNumber] ?? [];
  };

  getCumulativeKillsToNextLevel = (currentLevel: number): number | null => {
    return cumulativeKillsToNextLevel[currentLevel - 1] ?? null;
  };
}
