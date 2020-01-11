/**
 * @param {int} x
 * @param {int} y
 * @param {string} name
 * @param {int} damage
 * @param {int} maxHP
 * @constructor
 */
function Unit(x, y, name, damage, maxHP) {
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
    console.log('DAMAGE CALC: ' + damage);
    Object.values(unit.equipment).forEach(equippedItem => {
      console.log(equippedItem);
      damage += (equippedItem[Stats.DAMAGE] || 0);
    });
    console.log(damage);
    return damage;
  }

  /**
   * @type {string}
   */
  this.class = 'Unit';
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
   * @type {Function<void, void>}
   */
  this.update = () => {};

  this.damage = damage;

  this.getDamage = getDamage.bind(null, this);
}
