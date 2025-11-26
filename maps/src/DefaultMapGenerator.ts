import { AbstractMapGenerator } from './AbstractMapGenerator.js';
import { TileType } from '@duzh/models';
import { Coordinates, Grid, Heuristic, Pathfinder, Rect } from '@duzh/geometry';
import { randInt, shuffle } from '@duzh/utils/random';

const minRoomWidth = 4;
const minRoomHeight = 3;
const maxRoomWidth = 7;
const maxRoomHeight = 7;

type Props = Readonly<{
  fillRate: number;
}>;

export class DefaultMapGenerator extends AbstractMapGenerator {
  private readonly fillRate: number;
  constructor({ fillRate }: Props) {
    super();
    this.fillRate = fillRate;
  }

  generateTiles = (width: number, height: number): Grid<TileType> => {
    const tiles: TileType[][] = [];
    for (let y = 0; y < height; y++) {
      const row: TileType[] = [];
      for (let x = 0; x < width; x++) {
        row.push(TileType.NONE);
      }
      tiles.push(row);
    }

    const rooms: Rect[] = [];
    do {
      rooms.push(_addRandomRoom(tiles));
    } while (_countFloorTiles(tiles) <= width * height * this.fillRate);

    shuffle(rooms);
    const allTiles = Rect.getAllCoordinates({
      left: 1,
      top: 2,
      width: width - 2,
      height: height - 3
    });

    const pathfinder = Pathfinder.create({ heuristic: Heuristic.MANHATTAN });

    for (let i = 1; i < rooms.length; i++) {
      const firstTiles = Rect.getAllCoordinates(rooms[i - 1]);
      const secondTiles = Rect.getAllCoordinates(rooms[i]);
      shuffle(firstTiles);
      shuffle(secondTiles);

      let done = false;
      for (const first of firstTiles) {
        for (const second of secondTiles) {
          const path = pathfinder.findPath(first, second, allTiles);

          if (path.length > 0) {
            for (const { x, y } of path) {
              tiles[y][x] = TileType.FLOOR;
            }
            done = true;
            break;
          }
        }
        if (done) {
          break;
        }
      }
      if (!done) {
        throw new Error();
      }
    }

    _addWalls(tiles);

    return Grid.fromArray(tiles);
  };
}

const _addRandomRoom = (tiles: TileType[][]): Rect => {
  const emptyTiles: Coordinates[] = [];
  for (let y = 2; y < tiles.length - 1; y++) {
    for (let x = 1; x < tiles[0].length - 1; x++) {
      if (tiles[y][x] === TileType.NONE) {
        emptyTiles.push({ x, y });
      }
    }
  }
  shuffle(emptyTiles);

  for (const { x: left, y: top } of emptyTiles) {
    const width = randInt(minRoomWidth, maxRoomWidth);
    const height = randInt(minRoomHeight, maxRoomHeight);
    const right = left + width - 1;
    const bottom = top + height - 1;

    if (right > tiles[0].length - 2 || bottom > tiles.length - 2) {
      continue;
    }

    const bigRect = {
      left: left - 1,
      top: top - 2,
      width: width + 2,
      height: height + 4
    };
    const bigRectCoordinates: Coordinates[] = Rect.getAllCoordinates(bigRect).filter(
      ({ x, y }) => x >= 1 && x < tiles[0].length - 1 && y >= 2 && y < tiles.length - 1
    );

    if (bigRectCoordinates.some(({ x, y }) => tiles[y][x] === TileType.FLOOR)) {
      continue;
    }

    const roomRect = { left, top, width, height };
    const roomCoordinates: Coordinates[] = Rect.getAllCoordinates(roomRect);

    if (roomCoordinates.some(({ x, y }) => tiles[y][x] === TileType.FLOOR)) {
      continue;
    }

    for (const { x, y } of roomCoordinates) {
      tiles[y][x] = TileType.FLOOR;
    }
    return roomRect;
  }
  throw new Error();
};

const _countFloorTiles = (tiles: TileType[][]): number => {
  let count = 0;
  for (let y = 0; y < tiles.length; y++) {
    for (let x = 0; x < tiles[0].length; x++) {
      if (tiles[y][x] === TileType.FLOOR) {
        count++;
      }
    }
  }
  return count;
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
