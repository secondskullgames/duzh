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

  constructor(playerUnit, mapSuppliers) {
    this.playerUnit = playerUnit;
    this.mapSuppliers = mapSuppliers;
    this.messages = [];
    this.screen = 'GAME';
  }

  /**
   * @param {int} index
   */
  loadMap(index) {
    this.mapIndex = index;
    this.map = this.mapSuppliers[index].get();
  }
}
