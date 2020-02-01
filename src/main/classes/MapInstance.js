{
  function MapInstance(width, height, tiles, rooms, units, items) {
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
     * @type {Room[]}
     */
    this.rooms = rooms;
    /**
     * @type Unit[]
     */
    this.units = units;
    /**
     * @type MapItem[]
     */
    this.items = items;
    /**
     * @type {Coordinates[]}
     * @type {Array}
     */
    this.revealedTiles = [];

    /**
     * @return Tile
     */
    this.getTile = (x, y) => {
      const { Tiles } = jwb.types;
      if (x < this.width && y < this.height) {
        return (this.tiles[y] || [])[x] || Tiles.NONE;
      }
      throw `Illegal coordinates ${x}, ${y}`;
    };

    /**
     * @return {Unit|null}
     */
    this.getUnit = (x, y) => {
      return this.units.filter(u => u.x === x && u.y === y)[0] || null;
    };

    /**
     * @return {MapItem|null}
     */
    this.getItem = (x, y) => {
      return this.items.filter(i => i.x === x && i.y === y)[0] || null;
    };

    /**
     * @return boolean
     */
    this.contains = (x, y) => {
      return x >= 0 && x < this.width && y >= 0 && y < this.height;
    };

    /**
     * @return boolean
     */
    this.isBlocked = (x, y) => {
      if (!this.contains(x, y)) {
        throw `(${x}, ${y}) is not on the map`;
      }
      return this.getUnit(x, y) || this.getTile(x, y).isBlocking;
    };

    this.removeItem = ({ x, y }) => {
      const index = this.items.findIndex(i => (i.x === x && i.y === y));
      this.items.splice(index, 1);
    };

    this.getRect = () => ({
      left: 0,
      top: 0,
      width: this.width,
      height: this.height
    });
  }

  window.jwb = window.jwb || {};
  jwb.MapInstance = MapInstance;
}
