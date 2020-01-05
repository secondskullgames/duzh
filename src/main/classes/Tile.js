class Tile {
  /**
   * @type string
   */
  name;
  /**
   * @type string
   */
  char;
  /**
   * @type boolean
   */
  isBlocking;

  constructor(name, char, isBlocking) {
    this.name = name;
    this.char = char;
    this.isBlocking = isBlocking;
  }
}