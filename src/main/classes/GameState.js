class GameState {
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
  }

  /**
   * @param {int} index
   */
  loadMap(index) {
    this.mapIndex = index;
    this.map = this.mapSuppliers[index].get();
  }
}