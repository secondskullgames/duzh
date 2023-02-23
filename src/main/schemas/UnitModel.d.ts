import UnitType from './UnitType';

type UnitModel = {
  /**
   * Expected to match the filename
   */
  id: string,
  /**
   * Human-readable name for this unit type
   */
  name: string,
  /**
   * TODO: This includes ATTACK at position 0, followed by special abilities.
   * It doesn't include SHOOT_ARROW.
   */
  abilities: {
    [key: string]: string[]
  },
  aiParameters?: {
    /**
     * currently unused
     */
    aggressiveness: number,
    /**
     * ratio of (current life / max life)
     */
    fleeThreshold: number,
    /**
     * between 0 and 1
     */
    speed: number,
    /**
     * whole number of tiles
     */
    visionRange: number
  },
  equipment?: string[],
  damage: number,
  /**
   * null if this should not be randomly placed as an enemy
   */
  level: number | null,
  life: number,
  mana: number,
  paletteSwaps: {
    [key: string]: string
  },
  points: number | null,
  sprite: string,
  summonedUnitClass?: string,
  type: UnitType
};

export default UnitModel;
