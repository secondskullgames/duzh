{
  /**
   * @constructor
   */
  function GameState(playerUnit, mapSuppliers) {
    /**
     * @type 'GAME' | 'INVENTORY'
     */
    this.screen = 'GAME';
    /**
     * @type Unit
     */
    this.playerUnit = playerUnit;
    /**
     * @type MapSupplier[]
     */
    this.mapSuppliers = mapSuppliers;
    /**
     * @type int|null
     */
    this.mapIndex = 0;
    /**
     * @type MapInstance|null
     */
    this.map = null;
    /**
     * @type string[]
     */
    this.messages = [];
    /**
     * @type {ItemCategory}
     */
    this.inventoryCategory = null;
    /**
     * @type {int}
     */
    this.inventoryIndex = 0;
  }

  window.jwb = window.jwb || {};
  jwb.GameState = GameState;
}