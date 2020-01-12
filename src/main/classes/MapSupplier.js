/**
 * @constructor
 */
function MapSupplier(width, height, tiles, playerUnitLocation, enemyUnitLocations, enemyUnitSupplier, itemLocations, itemSupplier) {
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
   * @type Coordinates
   */
  this.playerUnitLocation = playerUnitLocation;
  /**
   * @type Coordinates[]
   */
  this.enemyUnitLocations = enemyUnitLocations;
  /**
   * @type {Function<void, Unit>}
   */
  this.enemyUnitSupplier = enemyUnitSupplier;
  /**
   * @type Coordinates[]
   */
  this.itemLocations = itemLocations;
  /**
   * @type {Function<Coordinates, MapItem>}
   */
  this.itemSupplier = itemSupplier;

  /**
   * @returns {MapInstance}
   */
  this.get = function() {
    const { playerUnit } = jwb.state;
    const units = [playerUnit];
    [playerUnit.x, playerUnit.y] = [this.playerUnitLocation.x, this.playerUnitLocation.y];
    units.push(...this.enemyUnitLocations.map(({ x, y }) => this.enemyUnitSupplier({ x, y })));
    const items = this.itemLocations.map(({ x, y }) => this.itemSupplier({ x, y }));
    return new MapInstance(
      this.width,
      this.height,
      this.tiles,
      units,
      items
    )
  }
}
