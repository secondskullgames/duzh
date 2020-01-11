{
  const { RandomUtils } = window.jwb.utils;
  const { randInt } = RandomUtils;
  function pickUnoccupiedLocations(tiles, occupiedLocations, numToChoose) {
    const { Tiles } = window.jwb.types;
    /**
     * @type {{ x: int, y: int }[]}
     */
    const unoccupiedLocations = [];
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        if (tiles[y][x] === Tiles.FLOOR) {
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

  window.jwb = window.jwb || {};
  window.jwb.utils = window.jwb.utils || {};
  window.jwb.utils.MapUtils = {
    pickUnoccupiedLocations
  };
}
