{
  const LIFE_PER_TURN_MULTIPLIER = 0.005;
  /**
   * @param {!UnitClass} unitClass
   * @param {!string} name
   * @param {!int} level
   * @param {!int} x
   * @param {!int} y
   * @param {!Object<string, string>} paletteSwaps
   * @constructor
   */
  function Unit(unitClass, name, level, { x, y }) {
    /**
     * @type {string}
     */
    this.class = 'Unit';
    this.unitClass = unitClass;
    /**
     * @type {Sprite}
     * @private
     */
    this._sprite = unitClass.sprite(unitClass.paletteSwaps);
    /**
     * @type {Object<ItemCategory, InventoryItem[]>}
     */
    this.inventory = {};
    Object.keys(jwb.types.ItemCategory).forEach(category => {
      this.inventory[category] = [];
    });

    /**
     * @type {Object<EquipmentCategory, EquippedItem?>}
     */
    this.equipment = {};
    Object.keys(jwb.types.EquipmentCategory).forEach(category => {
      this.equipment[category] = [];
    });
    /**
     * @type {int}
     */
    this.x = x;
    /**
     * @type {int}
     */
    this.y = y;
    /**
     * @type {string}
     */
    this.name = name;
    /**
     * @type {int}
     */
    this.level = level;
    /**
     * @type {int}
     */
    this.experience = 0;
    /**
     * @type {int}
     */
    this.maxLife = unitClass.startingLife;
    /**
     * @type {int}
     */
    this.life = unitClass.startingLife;
    /**
     * @type {int}
     */
    this.lifeRemainder = 0;
    /**
     * @type {int}
     * @private
     */
    this._damage = unitClass.startingDamage;
    /**
     * @type {function(!Unit: void) | null}
     */
    this.queuedOrder = null;
    /**
     * @type {function(!Unit: void) | null}
     */
    this.aiHandler = unitClass.aiHandler ? unitClass.aiHandler() : null;

    this._regenLife = function () {
      const lifePerTurn = (this.maxLife) * LIFE_PER_TURN_MULTIPLIER;
      this.lifeRemainder += lifePerTurn;
      const deltaLife = Math.floor(this.lifeRemainder);
      this.lifeRemainder -= deltaLife;
      this.life = Math.min(this.life + deltaLife, this.maxLife);
    };

    /**
     * @type {!function(): void}
     */
    this.update = () => {
      this._regenLife();

      if (!!this.queuedOrder) {
        this.queuedOrder.call(null, this);
        this.queuedOrder = null;
      }

      if (!!this.aiHandler) {
        this.aiHandler.call(null, this);
      }
    };

    /**
     * @return {!int}
     */
    this.getDamage = () => {
      let damage = this._damage;
      Object.values(this.equipment).forEach(equippedItem => {
        damage += (equippedItem.damage || 0);
      });
      return damage;
    };

    this.getSprite = () => {
      return this._sprite;
    };

    /**
     * @private
     */
    this._levelUp = () => {
      this.level++;
      const lifePerLevel = this.unitClass.lifePerLevel(this.level);
      this.maxLife += lifePerLevel;
      this.life += lifePerLevel;
      this._damage += this.unitClass.damagePerLevel(this.level);
      jwb.audio.playSound(jwb.Sounds.LEVEL_UP);
    };

    this.gainExperience = (experience) => {
      this.experience += experience;
      const experienceToNextLevel = this.experienceToNextLevel();
      while (!!experienceToNextLevel && this.experience >= experienceToNextLevel) {
        this.experience -= experienceToNextLevel;
        this._levelUp();
      }
    };

    /**
     * @returns {int | null}
     * @private
     */
    this.experienceToNextLevel = () => {
      if (unitClass.experienceToNextLevel && (this.level < unitClass.maxLevel)) {
        return unitClass.experienceToNextLevel(this.level);
      }
      return null;
    }
  }

  jwb.Unit = Unit;
}
