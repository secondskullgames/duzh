{
  /**
   * @param {!int} level
   * @param {!int} width
   * @param {!int} height
   * @param {!Tile[][]} tiles
   * @param {!Room[]} rooms
   * @param {!Coordinates} playerUnitLocation
   * @param {!Coordinates[]} enemyUnitLocations
   * @param {!function(!Coordinates, !int): !Unit} enemyUnitSupplier
   * @param {!Coordinates[]} itemLocations
   * @param {!function(!Coordinates): !MapItem} itemSupplier
   * @constructor
   */
  function MapSupplier(level, width, height, tiles, rooms, playerUnitLocation, enemyUnitLocations, enemyUnitSupplier, itemLocations, itemSupplier) {
    /**
     * @type !int
     */
    this.level = level;
    /**
     * @type !int
     */
    this.width = width;
    /**
     * @type !int
     */
    this.height = height;
    /**
     * [y][x]
     * @type !Tile[][]
     */
    this.tiles = tiles;
    /**
     * @type !Room[]
     */
    this.rooms = rooms;
    /**
     * @type !Coordinates
     */
    this.playerUnitLocation = playerUnitLocation;
    /**
     * @type !Coordinates[]
     */
    this.enemyUnitLocations = enemyUnitLocations;
    /**
     * @type {!function(!Coordinates, !int): !Unit}
     */
    this.enemyUnitSupplier = enemyUnitSupplier;
    /**
     * @type !Coordinates[]
     */
    this.itemLocations = itemLocations;
    /**
     * @type {!function(!Coordinates, !int): !MapItem}
     */
    this.itemSupplier = itemSupplier;

    /**
     * @returns {MapInstance}
     */
    this.get = function () {
      const { playerUnit } = jwb.state;
      const units = [playerUnit];
      [playerUnit.x, playerUnit.y] = [this.playerUnitLocation.x, this.playerUnitLocation.y];
      units.push(...this.enemyUnitLocations.map(({ x, y }) => this.enemyUnitSupplier({ x, y }, level)));
      const items = this.itemLocations.map(({ x, y }) => this.itemSupplier({ x, y }, level));
      return new MapInstance(
        this.width,
        this.height,
        this.tiles,
        this.rooms,
        units,
        items
      )
    }
  }

  window.jwb = window.jwb || {};
  jwb.MapSupplier = MapSupplier;
}