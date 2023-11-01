import UnitType from './UnitType';

type UnitModel = {
  /**
   * Expected to match the filename
   */
  id: string;
  /**
   * Human-readable name for this unit type
   */
  name: string;
  abilities: string[];
  aiParameters?: {
    /**
     * currently unused
     */
    aggressiveness: number;
    /**
     * ratio of (current life / max life)
     */
    fleeThreshold: number;
    /**
     * between 0 and 1
     */
    speed: number;
    /**
     * whole number of tiles
     */
    visionRange: number;
  };
  equipment?: string[];
  strength: number;
  dexterity: number;
  /**
   * undefined if this should not be randomly placed as an enemy
   */
  levelParameters?: {
    minLevel: number;
    maxLevel: number;
    points: number;
  };
  life: number;
  mana: number;
  paletteSwaps: {
    [key: string]: string;
  };
  sprite: string;
  summonedUnitClass?: string;
  type: UnitType;
};

export default UnitModel;
