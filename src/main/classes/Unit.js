{
  /**
   * @param {Sprite} sprite
   * @param {int} x
   * @param {int} y
   * @param {string} name
   * @param {int} damage
   * @param {int} maxHP
   * @constructor
   */
  function Unit(sprite, x, y, name, damage, maxHP) {
    /**
     * @type int
     */
    let currentHP = maxHP;
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

    function getDamage(unit) {
      const { Stats } = jwb.types;
      let damage = unit.damage;
      Object.values(unit.equipment).forEach(equippedItem => {
        damage += (equippedItem[Stats.DAMAGE] || 0);
      });
      return damage;
    }

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
    this.currentHP = currentHP;
    /**
     * @type {int}
     */
    this.maxHP = maxHP;
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
      if (!!this.queuedOrder) {
        this.queuedOrder.call(null, this);
        this.queuedOrder = null;
      }

      if (!!this.aiHandler) {
        this.aiHandler.call(null, this);
      }
    };

    this.damage = damage;
    /**
     * @type {Function<void, int>}
     */
    this.getDamage = function() {
      return getDamage(this);
    };

    this.getSprite = function() {
      return this._sprite;
    }
  }

  jwb.Unit = Unit;
}