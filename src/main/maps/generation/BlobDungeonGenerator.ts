import DungeonGenerator from './DungeonGenerator';
import { Coordinates, MapSection, TileSet, TileType } from '../../types/types';
import { randInt } from '../../utils/RandomUtils';
import { comparing } from '../../utils/ArrayUtils';
import { coordinatesEquals, isAdjacent } from '../MapUtils';

class BlobDungeonGenerator extends DungeonGenerator {
  constructor(tileSet: TileSet) {
    super(tileSet);
  }

  /**
   * Strategy:
   * Add a floor tile near the middle of the map.
   * Until the map is half-full, continue adding new tiles adjacent to existing tiles.
   * New tile placement should be random - but aim for a certain level of "snakiness",
   * where snakiness is defined as the number of tiles within N units
   * (more adjacent tiles - less snaky).
   */
  protected generateTiles(width: number, height: number): MapSection {
    const tiles = this._initTiles(width, height);

    this._placeInitialTile(width, height, tiles);
    const targetNumFloorTiles : number = this._getTargetNumFloorTiles(width * height);
    while (this._getFloorTiles(tiles).length < targetNumFloorTiles) {
      this._addFloorTile(tiles);
    }
    this._addWalls(tiles);
    return {
      tiles,
      width,
      height,
      rooms: []
    };
  }

  private _initTiles(width: number, height: number): TileType[][] {
    const tiles: TileType[][] = [];
    for (let y = 0; y < height; y++) {
      const row: TileType[] = [];
      for (let x = 0; x < width; x++) {
        row.push(TileType.NONE);
      }
      tiles.push(row);
    }
    return tiles;
  }

  private _placeInitialTile(width: number, height: number, tiles: TileType[][]) {
    const x = randInt(width * 3 / 8, width * 5 / 8);
    const y = randInt(height * 3 / 8, height * 5 / 8);
    tiles[y][x] = TileType.FLOOR;
  }

  private _getTargetNumFloorTiles(max: number) {
    return randInt(
      Math.round(max * 3 / 8),
      Math.round(max * 5 / 8)
    );
  }

  private _getFloorTiles(tiles: TileType[][]): Coordinates[] {
    const floorTiles: Coordinates[] = [];
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        if (tiles[y][x] === TileType.FLOOR) {
          floorTiles.push({ x, y });
        }
      }
    }
    return floorTiles;
  }

  private _getEmptyTiles(tiles: TileType[][]): Coordinates[] {
    const floorTiles: Coordinates[] = [];
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        if (tiles[y][x] === TileType.NONE) {
          floorTiles.push({ x, y });
        }
      }
    }
    return floorTiles;
  }

  private _addFloorTile(tiles: TileType[][]): void {
    const floorTiles = this._getFloorTiles(tiles);
    const candidates = this._getCandidates(tiles, floorTiles)
      .sort(comparing(tile => this._getSnakeScore(tile, tiles)));

    //const minIndex = 0;
    //const maxIndex = randInt(0, candidates.length - 1);

    const minIndex = Math.floor((candidates.length - 1) * 0.4);
    const maxIndex = Math.floor((candidates.length - 1) * 0.7);

    const index = randInt(minIndex, maxIndex);
    const { x, y } = candidates[index];
    tiles[y][x] = TileType.FLOOR;
  }

  private _getCandidates(tiles: TileType[][], floorTiles: Coordinates[]) {
    return this._getEmptyTiles(tiles)
      .filter(({ x, y }) => y > 0)
      .filter(({ x, y }) => {
        // To facilitate wall generation, disallow two specific cases:
        // 1. can't add a floor tile if there's a wall right above it, AND a floor tile right above that
        if (y >= 2) {
          if (tiles[y - 1][x] === TileType.NONE && tiles[y - 2][x] === TileType.FLOOR) {
            return false;
          }
        }
        // 2. can't add a floor tile if there's a wall right below it, AND a floor tile right below that
        if (y <= (tiles.length - 3)) {
          if (tiles[y + 1][x] === TileType.NONE && tiles[y + 2][x] === TileType.FLOOR) {
            return false;
          }
        }
        return true;
      })
      .filter(({ x, y }) => floorTiles.some(floorTile => isAdjacent({ x, y }, floorTile)));
  }

  /**
   * @return the number of nearby tiles
   */
  private _getSnakeScore(tile: Coordinates, tiles: TileType[][]) {
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
        if (coordinatesEquals(tile, { x, y })) {
          continue;
        }
        if (tiles[y][x] === TileType.FLOOR) {
          score++;
        }
      }
    }
    return score;
  }

  private _addWalls(tiles: TileType[][]) {
    const height = tiles.length;
    const width = tiles[0].length;
    for (let y = 0; y < (height - 1); y++) {
      for (let x = 0; x < width; x++) {
        if (tiles[y][x] === TileType.NONE && tiles[y + 1][x] === TileType.FLOOR) {
          tiles[y][x] = TileType.WALL_TOP;
        }
      }
    }
  }
}

export default BlobDungeonGenerator;