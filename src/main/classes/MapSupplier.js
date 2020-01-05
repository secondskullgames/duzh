class MapSupplier {
  /**
   * @type int
   */
  width;
  /**
   * @type int
   */
  height;
  /**
   * [y][x]
   * @type Tile[][]
   */
  tiles;
  /**
   * @type Coordinates
   */
  playerUnitLocation;
  /**
   * @type Coordinates[]
   */
  enemyUnitLocations;
  /**
   * @type {Function<void, Unit>}
   */
  enemyUnitSupplier;
  /**
   * @type Coordinates[]
   */
  itemLocations;

  constructor(width, height, tiles, playerUnitLocation, enemyUnitLocations, enemyUnitSupplier, itemLocations) {
    this.width = width;
    this.height = height;
    this.tiles = tiles;
    this.playerUnitLocation = playerUnitLocation;
    this.enemyUnitLocations = enemyUnitLocations;
    this.enemyUnitSupplier = enemyUnitSupplier;
    this.itemLocations = itemLocations;
  }

  /**
   * @returns {MapInstance}
   */
  get() {
    const { playerUnit } = window.jwb.state;
    const units = [playerUnit];
    [playerUnit.x, playerUnit.y ] = [this.playerUnitLocation.x, this.playerUnitLocation.y];
    units.push(...this.enemyUnitLocations.map(({ x, y }) => this.enemyUnitSupplier({ x, y })));
    return new MapInstance(
      this.width,
      this.height,
      this.tiles,
      units,
      [] // TODO items!
    )
  }
}
