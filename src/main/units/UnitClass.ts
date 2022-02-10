import PaletteSwaps from '../types/PaletteSwaps';
import { UnitType } from '../types/types';
import memoize from '../utils/memoize';
import UnitAbility from './UnitAbility';

interface UnitClass {
  readonly name: string;
  readonly sprite: string,
  readonly type: UnitType;
  readonly paletteSwaps: PaletteSwaps;
  readonly startingLife: number;
  readonly startingMana: number | null;
  readonly startingDamage: number;
  readonly lifePerLevel: number;
  readonly manaPerLevel: number | null;
  readonly damagePerLevel: number;
  readonly equipment?: string[];
  readonly experienceToNextLevel?: number[];
  readonly aiParameters?: AIParameters;
  /**
   * TODO: This does not include ATTACK or SHOOT_ARROW.  Should it?
   */
  readonly abilities: Record<number, UnitAbility.Name[]>;
}

const _load = async (name: string): Promise<UnitClass> => {
  const json = (await import(`../../../data/units/${name}.json`)).default;
  return {
    ...json,
    // We're using "friendly" color names, convert them to hex now
    paletteSwaps: PaletteSwaps.create(json.paletteSwaps),
  } as UnitClass;
};

namespace UnitClass {
  export const load = memoize(_load);
}

export default UnitClass;
