{
  function pickUnoccupiedLocations(tiles, allowedTileTypes, occupiedLocations, numToChoose) {
    const { Tiles } = jwb.types;
    const { RandomUtils } = jwb.utils;
    const { randInt } = RandomUtils;
    /**
     * @type {{ x: int, y: int }[]}
     */
    const unoccupiedLocations = [];
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        if (allowedTileTypes.indexOf(tiles[y][x]) !== -1) {
          if (occupiedLocations.filter(loc => (loc.x === x && loc.y === y)).length === 0) {
            unoccupiedLocations.push({ x, y });
          }
        }
      }
    }

    const chosenLocations = [];
    for (let i = 0; i < numToChoose; i++) {
      if (unoccupiedLocations.length > 0) {
        const index = randInt(0, unoccupiedLocations.length - 1);
        const { x, y } = unoccupiedLocations[index];
        chosenLocations.push({ x, y });
        occupiedLocations.push({ x, y });
        unoccupiedLocations.splice(index, 1);
      }
    }
    return chosenLocations;
  }

  /**
   * This is implemented as (x distance + y distance), since all movement is just 4-directional
   * so it legitimately takes twice as long to move diagonally
   *
   * @param {Coordinates} first
   * @param {Coordinates} second
   */
  function distance(first, second) {
    return Math.abs(first.x - second.x) + Math.abs(first.y - second.y);
  }

  window.jwb = window.jwb || {};
  jwb.utils = jwb.utils || {};
  jwb.utils.MapUtils = {
    pickUnoccupiedLocations,
    distance
  };
}
