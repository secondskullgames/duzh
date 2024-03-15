export type AIParameters = Readonly<{
  /**
   * between 0 and 1
   */
  speed: number;
  /**
   * range where this unit has some awareness of enemies
   * whole number of tiles
   */
  visionRange: number;
  /**
   * chance to engage when in "medium range"
   * between 0 and 1
   */
  aggressiveness: number;
  /**
   * ratio of (current life / max life)
   */
  fleeThreshold: number;
}>;
