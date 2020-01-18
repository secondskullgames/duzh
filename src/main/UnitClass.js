{
  window.jwb = window.jwb || {};

  /**
   * @typedef {Object} UnitClass
   * @property {int} startingDamage
   * @property {int} startingLife
   * @property {Function} experienceToNextLevel (int => int)
   * @property {Function} damagePerLevel (int => int)
   * @property {Function} lifePerLevel (int => int)
   */

  jwb.UnitClass = {
    /**
     * @type UnitClass
     */
    PLAYER: {
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
      startingLife: 50,
      startingDamage: 5,
      lifePerLevel: () => 5,
      damagePerLevel: () => 1,
      experienceToNextLevel: () => null
    }
  };
}