class Unit {
  x;
  y;
  name;
  currentHP;
  maxHP;

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
}