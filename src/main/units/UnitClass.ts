import { PaletteSwaps } from '../types/types';
import { UnitAI } from './UnitAI';
import Unit from './Unit';
import Sprite from '../graphics/sprites/Sprite';

interface UnitClass {
  readonly name: string;
  readonly paletteSwaps: PaletteSwaps;
  readonly startingLife: number;
  readonly startingMana: number | null;
  readonly startingDamage: number;
  readonly minLevel: number;
  readonly maxLevel: number;
  readonly lifePerLevel: (level: number) => number;
  readonly manaPerLevel: (level: number) => (number | null);
  readonly damagePerLevel: (level: number) => number;
  readonly experienceToNextLevel?: (level: number) => (number | null);
  readonly aiHandler?: UnitAI;
  readonly sprite: (unit: Unit, paletteSwaps: PaletteSwaps) => Sprite;
}

export default UnitClass;