import { PaletteSwaps } from '../types';
import Sprite from './Sprite';
import { UnitAI } from '../UnitAI';

interface UnitClass {
  readonly name: string;
  readonly paletteSwaps: PaletteSwaps;
  readonly startingLife: number;
  readonly startingDamage: number;
  readonly minLevel: number;
  readonly maxLevel: number;
  readonly lifePerLevel: (level: number) => number;
  readonly damagePerLevel: (level: number) => number;
  readonly experienceToNextLevel?: (level: number) => (number | null);
  readonly aiHandler?: UnitAI;
  readonly sprite: (unitClass: UnitClass) => Sprite;
}

export default UnitClass;