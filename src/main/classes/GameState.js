class GameState {
  /**
   * @type 'GAME' | 'INVENTORY'
   */
  screen;
  /**
   * @type Unit
   */
  playerUnit;
  /**
   * @type MapSupplier[]
   */
  mapSuppliers;
  /**
   * @type int|null
   */
  mapIndex;
  /**
   * @type MapInstance|null
   */
  map;
  /**
   * @type string[]
   */
  messages;
  /**
   * @type {ItemCategory}
   */
  inventoryCategory;
  /**
   * @type {int}
   */
  inventoryIndex;

  constructor(playerUnit, mapSuppliers) {
    this.playerUnit = playerUnit;
    this.mapSuppliers = mapSuppliers;
    this.messages = [];
    this.screen = 'GAME';
    this.inventoryCategory = null;
    this.inventoryIndex = 0;
  }
}
