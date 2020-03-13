import Unit from './Unit';
import Sprite from '../graphics/sprites/Sprite';
import { PaletteSwaps, UnitType } from '../types/types';
import { UnitAI } from './UnitAI';

interface AIParameters {
  /**
   * between 0 and 1
   */
  speed: number,
  /**
   * whole number of tiles
   */
  visionRange: number,
  /**
   * ratio of (current life / max life)
   */
  fleeThreshold: number
}

interface UnitClass {
  readonly name: string;
  readonly type: UnitType;
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
  readonly aiParams?: AIParameters
}

export default UnitClass;