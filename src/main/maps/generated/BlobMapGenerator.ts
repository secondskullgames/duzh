import AbstractMapGenerator from './AbstractMapGenerator';
import TileType from '../../schemas/TileType';
import TileFactory from '../../tiles/TileFactory';
import { Coordinates } from '@main/geometry';
import { comparing, range } from '@main/utils/arrays';
import { randInt } from '@main/utils/random';
import { isAdjacent } from '@main/geometry/CoordinatesUtils';

class BlobMapGenerator extends AbstractMapGenerator {
  constructor(tileFactory: TileFactory) {
    super(tileFactory);
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
    const targetNumFloorTiles: number = this._getTargetNumFloorTiles(width * height);
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
        row.push('NONE');
      }
      tiles.push(row);
    }
    return tiles;
  };

  private _placeInitialTile = (width: number, height: number, tiles: TileType[][]) => {
    const x = randInt((width * 3) / 8, (width * 5) / 8);
    const y = randInt((height * 3) / 8, (height * 5) / 8);
    tiles[y][x] = 'FLOOR';
  };

  private _getTargetNumFloorTiles = (max: number) => {
    const minRatio = 0.3;
    const maxRatio = 0.6;
    return randInt(Math.round(max * minRatio), Math.round(max * maxRatio));
  };

  private _getFloorTiles = (tiles: TileType[][]): Coordinates[] => {
    const floorTiles: Coordinates[] = [];
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        if (tiles[y][x] === 'FLOOR') {
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
        if (tiles[y][x] === 'NONE') {
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
    const minIndex = Math.floor((candidates.length - 1) * 0.1);
    const maxIndex = Math.floor((candidates.length - 1) * 0.9);
    const index = randInt(minIndex, maxIndex);

    const { x, y } = candidates[index];
    tiles[y][x] = 'FLOOR';
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
          range(y - (n - 1), y - 1).every(y2 => tiles[y2][x] === 'NONE') &&
          tiles[y - n][x] === 'FLOOR'
        ) {
          return false;
        }
      }
      // 2. can't add a floor tile if there's a wall right below it, AND a floor tile right below that
      if (y <= height - 1 - n) {
        if (
          range(y + 1, y + (n - 1)).every(y2 => tiles[y2][x] === 'NONE') &&
          tiles[y + n][x] === 'FLOOR'
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
      } else if (tiles[y2][x2] === 'FLOOR') {
        if (tiles[y2][x] === 'NONE' && tiles[y][x2] === 'NONE') {
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
          tiles[b.y][b.x] === 'NONE' &&
          tiles[c.y][c.x] === 'NONE' &&
          tiles[d.y][d.x] === 'NONE' &&
          tiles[f.y][f.x] === 'FLOOR'
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
          if (tiles[y][x] === 'NONE' && tiles[y + 1][x] === 'FLOOR') {
            tiles[y][x] = 'WALL';
          }
        }
        if (y < bottom - 2) {
          if (tiles[y + 1][x] === 'NONE' && tiles[y + 2][x] === 'FLOOR') {
            tiles[y][x] = 'WALL_TOP';
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
        if (tiles[y][x] === 'FLOOR') {
          score++;
        }
      }
    }
    return score;
  };
}

export default BlobMapGenerator;
