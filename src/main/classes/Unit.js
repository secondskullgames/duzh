class Unit {
  x;
  y;
  name;
  currentHP;
  maxHP;
  items = [];

  constructor(x, y, name, maxHP) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.currentHP = maxHP;
    this.maxHP = maxHP;
  }

  /**
   * Instances can override this with their own AI
   */
  update() {}

  /**
   * @param {MapItem} item
   */
  pickupItem(item) {
    this.items.push(item);
  }
}