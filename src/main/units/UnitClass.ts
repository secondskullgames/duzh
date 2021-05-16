import { PaletteSwaps, UnitType } from '../types/types';

interface UnitClass {
  readonly name: string;
  readonly sprite: string,
  readonly type: UnitType;
  readonly paletteSwaps: PaletteSwaps;
  readonly startingLife: number;
  readonly startingMana: number | null;
  readonly startingDamage: number;
  readonly minLevel: number;
  readonly maxLevel: number;
  readonly lifePerLevel: number;
  readonly manaPerLevel: number | null;
  readonly damagePerLevel: number;
  readonly equipment?: string[];

  // TODO move these somewhere else
  readonly experienceToNextLevel?: number[];
  readonly aiParameters?: AIParameters;
}

export default UnitClass;