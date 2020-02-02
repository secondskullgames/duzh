/**
 * @constructor
 */
function MapSupplier(level, width, height, tiles, rooms, playerUnitLocation, enemyUnitLocations, enemyUnitSupplier, itemLocations, itemSupplier) {
  /**
   * @type int
   */
  this.level = level;
  /**
   * @type int
   */
  this.width = width;
  /**
   * @type int
   */
  this.height = height;
  /**
   * [y][x]
   * @type Tile[][]
   */
  this.tiles = tiles;
  /**
   * @type Room[]
   */
  this.rooms = rooms;
  /**
   * @type Coordinates
   */
  this.playerUnitLocation = playerUnitLocation;
  /**
   * @type Coordinates[]
   */
  this.enemyUnitLocations = enemyUnitLocations;
  /**
   * @type {Function} (void -> unit)
   */
  this.enemyUnitSupplier = enemyUnitSupplier;
  /**
   * @type Coordinates[]
   */
  this.itemLocations = itemLocations;
  /**
   * @type {Function} (coordinates -> MapItem)
   */
  this.itemSupplier = itemSupplier;

  /**
   * @returns {MapInstance}
   */
  this.get = function() {
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
