{
  window.jwb = window.jwb || {};

  /**
   * @typedef {Object} UnitClass
   * @property {Function} sprite
   * @property {int} startingDamage
   * @property {int} startingLife
   * @property {Function} lifePerLevel (int => int)
   * @property {Function} damagePerLevel (int => int)
   * @property {Function} experienceToNextLevel (int => int)
   */
  jwb.UnitClass = {
    /**
     * @type UnitClass
     */
    PLAYER: {
      sprite: paletteSwaps => jwb.SpriteFactory.PLAYER(paletteSwaps),
      startingLife: 100,
      startingDamage: 10,
      lifePerLevel: level => 10,
      damagePerLevel: level => 2,
      experienceToNextLevel: currentLevel  => (currentLevel < 10) ? 2 * currentLevel + 4: null
    },
    /**
     * @type UnitClass
     */
    ENEMY_HUMAN: {
      sprite: paletteSwaps => jwb.SpriteFactory.PLAYER(paletteSwaps),
      startingLife: 50,
      startingDamage: 5,
      lifePerLevel: () => 5,
      damagePerLevel: () => 2,
      experienceToNextLevel: () => null
    }
  };
}