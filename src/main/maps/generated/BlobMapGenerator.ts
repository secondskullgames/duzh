import { AbstractMapGenerator } from './AbstractMapGenerator';
import TileFactory from '../../tiles/TileFactory';
import { TileType } from '@models/TileType';
import { Coordinates } from '@lib/geometry/Coordinates';
import { comparing, range } from '@lib/utils/arrays';
import { randInt } from '@lib/utils/random';
import { isAdjacent } from '@lib/geometry/CoordinatesUtils';

const minCenterXRatio = 3 / 8;
const maxCenterXRatio = 5 / 8;
const minCenterYRatio = 3 / 8;
const maxCenterYRatio = 5 / 8;

type Props = Readonly<{
  tileFactory: TileFactory;
  fillRate: number;
}>;

export class BlobMapGenerator extends AbstractMapGenerator {
  private readonly fillRate: number;
  constructor({ tileFactory, fillRate }: Props) {
    super(tileFactory);
    this.fillRate = fillRate;
  }

  /**
   * Strategy:
   * Add a floor tile near the middle of the map.
   * Until the map is half-full, continue adding new tiles adjacent to existing tiles.
   * New tile placement should be random - but aim for a certain level of "snakiness",
   * where snakiness is defined as the number of tiles within N units
   * (more adjacent tiles - less snaky).
   */
  protected generateTiles = (width: number, height: number): TileType[][] => {
    const tiles = this._initTiles(width, height);

    this._placeInitialTile(width, height, tiles);
    const targetNumFloorTiles = Math.round(width * height * this.fillRate);
    while (this._getFloorTiles(tiles).length < targetNumFloorTiles) {
      if (!this._addFloorTile(tiles)) {
        break;
      }
    }
    this._addWalls(tiles);
    return tiles;
  };

  private _initTiles = (width: number, height: number): TileType[][] => {
    const tiles: TileType[][] = [];
    for (let y = 0; y < height; y++) {
      const row: TileType[] = [];
      for (let x = 0; x < width; x++) {
        row.push(TileType.NONE);
      }
      tiles.push(row);
    }
    return tiles;
  };

  private _placeInitialTile = (width: number, height: number, tiles: TileType[][]) => {
    const x = randInt(width * minCenterXRatio, width * maxCenterXRatio);
    const y = randInt(height * minCenterYRatio, height * maxCenterYRatio);
    tiles[y][x] = TileType.FLOOR;
  };

  private _getFloorTiles = (tiles: TileType[][]): Coordinates[] => {
    const floorTiles: Coordinates[] = [];
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        if (tiles[y][x] === TileType.FLOOR) {
          floorTiles.push({ x, y });
        }
      }
    }
    return floorTiles;
  };

  private _getEmptyTiles = (tiles: TileType[][]): Coordinates[] => {
    const floorTiles: Coordinates[] = [];
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        if (tiles[y][x] === TileType.NONE) {
          floorTiles.push({ x, y });
        }
      }
    }
    return floorTiles;
  };

  /**
   * @return whether a tile was successfully added
   */
  private _addFloorTile = (tiles: TileType[][]): boolean => {
    const floorTiles = this._getFloorTiles(tiles);
    const candidates = this._getCandidates(tiles, floorTiles).sort(
      comparing(tile => this._getSnakeScore(tile, tiles))
    );

    if (candidates.length === 0) {
      return false;
    }

    // change these ratios to adjust the "snakiness"
    const minIndex = Math.floor((candidates.length - 1) * 0.3);
    const maxIndex = Math.floor((candidates.length - 1) * 0.8);
    const index = randInt(minIndex, maxIndex);

    const { x, y } = candidates[index];
    tiles[y][x] = TileType.FLOOR;
    return true;
  };

  private _getCandidates = (
    tiles: TileType[][],
    floorTiles: Coordinates[]
  ): Coordinates[] => {
    const width = tiles[0].length;
    const height = tiles.length;
    return this._getEmptyTiles(tiles)
      .filter(({ x, y }) => x > 0 && x < width - 1 && y > 0 && y < height - 1)
      .filter(({ x, y }) => this._isLegalWallCoordinates({ x, y }, tiles))
      .filter(({ x, y }) =>
        floorTiles.some(floorTile => isAdjacent({ x, y }, floorTile))
      );
  };

  private _isLegalWallCoordinates = ({ x, y }: Coordinates, tiles: TileType[][]) => {
    // To facilitate wall generation, disallow some specific cases:
    // 1. can't add a floor tile if there's a wall right above it, AND a floor tile right above that
    const height = tiles.length;
    const m = 3; // number of consecutive wall tiles required
    for (let n = 2; n <= m; n++) {
      if (y >= n) {
        if (
          range(y - (n - 1), y - 1).every(y2 => tiles[y2][x] === TileType.NONE) &&
          tiles[y - n][x] === TileType.FLOOR
        ) {
          return false;
        }
      }
      // 2. can't add a floor tile if there's a wall right below it, AND a floor tile right below that
      if (y <= height - 1 - n) {
        if (
          range(y + 1, y + (n - 1)).every(y2 => tiles[y2][x] === TileType.NONE) &&
          tiles[y + n][x] === TileType.FLOOR
        ) {
          return false;
        }
      }
      // 3. check for kitty corner floor tiles
      if (this._hasKittyCornerFloorTile({ x, y }, tiles)) {
        return false;
      }
    }
    return true;
  };

  private _hasKittyCornerFloorTile = ({ x, y }: Coordinates, tiles: TileType[][]) => {
    const height = tiles.length;
    const width = tiles[0].length;
    // one tile apart vertically
    for (const [dx, dy] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1]
    ]) {
      const [x2, y2] = [x + dx, y + dy];
      if (x2 < 0 || x2 >= width || y2 < 0 || y2 >= height) {
        // out of bounds
      } else if (tiles[y2][x2] === TileType.FLOOR) {
        if (tiles[y2][x] === TileType.NONE && tiles[y][x2] === TileType.NONE) {
          return true;
        }
      }
    }
    // two tiles apart vertically
    // @X        ab
    // XX        cd
    //  F        ef
    for (const [dx, dy] of [
      [-1, -2],
      [1, -2],
      [-1, 2],
      [1, 2]
    ]) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const a = { x, y };
      const b = { x: x + dx, y };
      const c = { x, y: y + dy / 2 };
      const d = { x: x + dx, y: y + dy / 2 };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const e = { x, y: y + dy };
      const f = { x: x + dx, y: y + dy };
      if (f.x < 0 || f.x >= width || f.y < 0 || f.y >= height) {
        // out of bounds
      } else {
        if (
          tiles[b.y][b.x] === TileType.NONE &&
          tiles[c.y][c.x] === TileType.NONE &&
          tiles[d.y][d.x] === TileType.NONE &&
          tiles[f.y][f.x] === TileType.FLOOR
        ) {
          return true;
        }
      }
    }
    return false;
  };

  private _addWalls = (tiles: TileType[][]) => {
    const height = tiles.length;
    const width = tiles[0].length;
    const bottom = height - 1;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (y < bottom - 1) {
          if (tiles[y][x] === TileType.NONE && tiles[y + 1][x] === TileType.FLOOR) {
            tiles[y][x] = TileType.WALL;
          }
        }
        if (y < bottom - 2) {
          if (tiles[y + 1][x] === TileType.NONE && tiles[y + 2][x] === TileType.FLOOR) {
            tiles[y][x] = TileType.WALL_TOP;
          }
        }
      }
    }
  };

  /**
   * @return the number of nearby tiles
   */
  private _getSnakeScore = (tile: Coordinates, tiles: TileType[][]) => {
    let score = 0;
    const offset = 1;
    const height = tiles.length;
    const width = tiles[0].length;
    const minY = Math.max(0, tile.y - offset);
    const maxY = Math.min(tile.y + offset, height - 1);
    const minX = Math.max(0, tile.x - offset);
    const maxX = Math.min(tile.x + offset, width - 1);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (Coordinates.equals(tile, { x, y })) {
          continue;
        }
        if (tiles[y][x] === TileType.FLOOR) {
          score++;
        }
      }
    }
    return score;
  };
}
