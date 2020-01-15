{
  /**
   * @param {Sprite} sprite
   * @param {int} x
   * @param {int} y
   * @param {string} name
   * @param {int} damage
   * @param {int} hp
   * @param {int} hpPerTurn
   * @constructor
   */
  function Unit(sprite, x, y, name, damage, hp, hpPerTurn) {
    /**
     * @type {Object<ItemCategory, InventoryItem[]>}
     */
    const inventory = {};
    Object.keys(jwb.types.ItemCategory).forEach(category => {
      inventory[category] = [];
    });

    /**
     * @type {Object<EquipmentCategory, EquippedItem?>}
     */
    const equipment = {};
    Object.keys(jwb.types.EquipmentCategory).forEach(category => {
      inventory[category] = [];
    });

    /**
     * @type {string}
     */
    this.class = 'Unit';
    /**
     * @type {Sprite | null}
     * @private
     */
    this._sprite = sprite;
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
    this.maxHP = hp;
    /**
     * @type {int}
     */
    this.currentHP = hp;
    /**
     * @type {int}
     */
    this.hpPerTurn = hpPerTurn;
    /**
     * @type {int}
     */
    this.hpRemainder = 0;
    /**
     * @type {int}
     */
    this.damage = damage;
    /**
     * @type {Object<ItemCategory, InventoryItem[]>}
     */
    this.inventory = inventory;
    /**
     * @type {Object<EquipmentCategory, EquippedItem?>} equipment
     */
    this.equipment = equipment;

    /**
     * @type {Function<Unit, void> | null}
     */
    this.queuedOrder = null;
    /**
     * @type {Function<Unit, void> | null}
     */
    this.aiHandler = null;
    /**
     * @type {Function<void, void>}
     */
    this.update = () => {
      // regen hp
      this.hpRemainder += this.hpPerTurn;
      const deltaHP = Math.floor(this.hpRemainder);
      this.hpRemainder -= deltaHP;
      this.currentHP = Math.min(this.currentHP + deltaHP, this.maxHP);
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
      let damage = this.damage;
      Object.values(this.equipment).forEach(equippedItem => {
        damage += (equippedItem.damage || 0);
      });
      return damage;
    };

    this.getSprite = function() {
      return this._sprite;
    }
  }

  jwb.Unit = Unit;
}
