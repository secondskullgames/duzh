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
  /**
   * @type {Function<Coordinates, MapItem>}
   */
  itemSupplier;

  constructor(width, height, tiles, playerUnitLocation, enemyUnitLocations, enemyUnitSupplier, itemLocations, itemSupplier) {
    this.width = width;
    this.height = height;
    this.tiles = tiles;
    this.playerUnitLocation = playerUnitLocation;
    this.enemyUnitLocations = enemyUnitLocations;
    this.enemyUnitSupplier = enemyUnitSupplier;
    this.itemLocations = itemLocations;
    this.itemSupplier = itemSupplier;
  }

  /**
   * @returns {MapInstance}
   */
  get() {
    const { playerUnit } = window.jwb.state;
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
