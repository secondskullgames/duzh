import { AbstractMapGenerator } from './AbstractMapGenerator';
import { TileType } from '@duzh/models';
import { Grid, Coordinates, Heuristic, Pathfinder } from '@duzh/geometry';
import { range } from '@duzh/utils/arrays';
import { randInt } from '@duzh/utils/random';

type Props = Readonly<{
  numPoints: number;
}>;

/**
 * A map generator which randomly places points on a map and uses a pathfinding
 * algorithm to connect them with irregularly shaped paths of floor tiles.
 */
export class PathMapGenerator extends AbstractMapGenerator {
  private readonly numPoints: number;
  constructor({ numPoints }: Props) {
    super();
    this.numPoints = numPoints;
  }

  /** @override {@link AbstractMapGenerator#generateTiles} */
  protected generateTiles = (width: number, height: number): Grid<TileType> => {
    const tiles: TileType[][] = [];
    for (let y = 0; y < height; y++) {
      const row: TileType[] = [];
      for (let x = 0; x < width; x++) {
        row.push(TileType.NONE);
      }
      tiles.push(row);
    }

    const firstPoint = _randomEmptyTile(tiles);
    tiles[firstPoint.y][firstPoint.x] = TileType.NONE;

    const pathfinder = Pathfinder.create({ heuristic: Heuristic.MANHATTAN });

    let lastPoint = firstPoint;
    for (let i = 1; i < this.numPoints; i++) {
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
          console.debug(
            `No path from ${JSON.stringify(lastPoint)} to ${JSON.stringify(nextPoint)}`
          );
          //throw new Error();
          continue;
        }
        for (const { x, y } of path) {
          tiles[y][x] = TileType.FLOOR;
        }
        lastPoint = nextPoint;
        break;
      }
    }

    _addWalls(tiles);

    return Grid.fromArray(tiles);
  };
}

const _randomEmptyTile = (tiles: TileType[][]): Coordinates => {
  const width = tiles[0].length;
  const height = tiles.length;
  const right = width - 1;
  const bottom = height - 1;

  while (true) {
    const x = randInt(1, right - 1);
    const y = randInt(2, bottom - 1);

    if (tiles[y][x] === TileType.NONE) {
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
      if (tile === TileType.NONE && oneDown === TileType.FLOOR) {
        tiles[y][x] = oneUp === TileType.FLOOR ? TileType.FLOOR : TileType.WALL;
      }
    }
  }
};
