import { UnitType } from './UnitType';
import { AIParameters } from './AIParameters';

export type UnitModel = Readonly<{
  /**
   * Expected to match the filename
   */
  id: string;
  /**
   * Human-readable name for this unit type
   */
  name: string;
  abilities: string[];
  aiParameters?: AIParameters;
  equipment?: string[];
  strength: number;
  dexterity: number;
  /**
   * undefined if this should not be randomly placed as an enemy
   */
  levelParameters?: {
    rarity: number;
  };
  life: number;
  mana: number;
  paletteSwaps: {
    [key: string]: string;
  };
  sprite: string;
  summonedUnitClass?: string;
  type: UnitType;
  /**
   * experience rewarded on death
   */
  experience?: number;
}>;
