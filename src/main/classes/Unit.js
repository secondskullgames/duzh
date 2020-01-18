{
  const LIFE_PER_TURN_MULTIPLIER = 0.001;
  /**
   * @param {Sprite} sprite
   * @param {UnitClass} unitClass
   * @param {string} name
   * @param {int} level
   * @param {int} x
   * @param {int} y
   * @constructor
   */
  function Unit(sprite, unitClass, name, level, { x, y }) {
    /**
     * @type {string}
     */
    this.class = 'Unit';
    this.unitClass = unitClass;
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
    this.experienceToNextLevel = unitClass.experienceToNextLevel(level);
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
     * @type {Function<Unit, void> | null}
     */
    this.queuedOrder = null;
    /**
     * @type {Function<Unit, void> | null}
     */
    this.aiHandler = null;

    this._regenLife = function () {
      const lifePerTurn = (this.maxLife) * LIFE_PER_TURN_MULTIPLIER;
      this.lifeRemainder += lifePerTurn;
      const deltaLife = Math.floor(this.lifeRemainder);
      this.lifeRemainder -= deltaLife;
      this.life = Math.min(this.life + deltaLife, this.maxLife);
    };

    /**
     * @type {Function<void, void>}
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
     * @return {int}
     */
    this.getDamage = () => {
      let damage = this._damage;
      Object.values(this.equipment).forEach(equippedItem => {
        damage += (equippedItem.damage || 0);
      });
      return damage;
    };

    this.getSprite = () => {
      return sprite;
    };

    /**
     * @private
     */
    this._levelUp = () => {
      const { experienceToNextLevel } = this;
      this.level++;
      this.experience -= experienceToNextLevel;
      const lifePerLevel = this.unitClass.lifePerLevel(this.level);
      this.maxLife += lifePerLevel;
      this.life += lifePerLevel;
      this._damage += this.unitClass.damagePerLevel(this.level);
      this.experienceToNextLevel = this.unitClass.experienceToNextLevel(this.level);
    };

    this.gainExperience = (experience) => {
      this.experience += experience;
      const { experienceToNextLevel } = this;
      if (experienceToNextLevel !== null && this.experience >= experienceToNextLevel) {
        this._levelUp();
      }
    };
  }

  jwb.Unit = Unit;
}
