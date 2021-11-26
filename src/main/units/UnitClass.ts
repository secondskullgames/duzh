import PaletteSwaps from '../types/PaletteSwaps';
import { UnitType } from '../types/types';
import memoize from '../utils/memoize';

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
