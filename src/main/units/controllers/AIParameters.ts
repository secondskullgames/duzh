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
