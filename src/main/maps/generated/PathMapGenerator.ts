import AbstractMapGenerator from './AbstractMapGenerator';
import Coordinates from '../../geometry/Coordinates';
import { Pathfinder } from '../../geometry/Pathfinder';
import { range } from '../../utils/arrays';
import { randInt } from '../../utils/random';
import TileType from '../../schemas/TileType';
import TileFactory from '../../tiles/TileFactory';

class PathMapGenerator extends AbstractMapGenerator {
  constructor(tileFactory: TileFactory) {
    super(tileFactory);
  }

  /** @override {@link AbstractMapGenerator#generateTiles} */
  protected generateTiles = (width: number, height: number): TileType[][] => {
    const tiles: TileType[][] = [];
    for (let y = 0; y < height; y++) {
      const row: TileType[] = [];
      for (let x = 0; x < width; x++) {
        row.push('NONE');
      }
      tiles.push(row);
    }

    const numPoints = 20;

    const firstPoint = _randomEmptyTile(tiles);
    tiles[firstPoint.y][firstPoint.x] = 'NONE';

    const pathfinder = Pathfinder.create();

    let lastPoint = firstPoint;
    for (let i = 1; i < numPoints; i++) {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const nextPoint = _randomEmptyTile(tiles);
        const allCoordinates: Coordinates[] = range(2, height - 2).flatMap(y =>
          range(1, width - 2).map(x => ({ x, y }))
        );
        const path: Coordinates[] = pathfinder.findPath(
          lastPoint,
          nextPoint,
          allCoordinates
        );
        if (path.length === 0) {
          // eslint-disable-next-line no-console
          console.debug(
            `No path from ${JSON.stringify(lastPoint)} to ${JSON.stringify(nextPoint)}`
          );
          //throw new Error();
          continue;
        }
        for (const { x, y } of path) {
          tiles[y][x] = 'FLOOR';
        }
        lastPoint = nextPoint;
        break;
      }
    }

    _addWalls(tiles);

    return tiles;
  };
}

const _randomEmptyTile = (tiles: TileType[][]): Coordinates => {
  const width = tiles[0].length;
  const height = tiles.length;
  const right = width - 1;
  const bottom = height - 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const x = randInt(1, right - 1);
    const y = randInt(2, bottom - 1);

    if (tiles[y][x] === 'NONE') {
      return { x, y };
    }
  }
};

const _addWalls = (tiles: TileType[][]) => {
  const width = tiles[0].length;
  const height = tiles.length;
  const bottom = height - 1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = tiles[y][x];
      const oneDown = y < bottom ? tiles[y + 1][x] : null;
      const oneUp = y > 0 ? tiles[y - 1][x] : null;
      if (tile === 'NONE' && oneDown === 'FLOOR') {
        tiles[y][x] = oneUp === 'FLOOR' ? 'FLOOR' : 'WALL';
      }
    }
  }
};

export default PathMapGenerator;
