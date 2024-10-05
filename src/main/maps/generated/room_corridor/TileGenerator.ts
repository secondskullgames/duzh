import EmptyRegionConnection from './EmptyRegionConnection';
import RoomRegion from './RoomRegion';
import SplitDirection from './SplitDirection';
import { Connection } from './Connection';
import { TileType } from '@models/TileType';
import { Coordinates } from '@lib/geometry/Coordinates';
import { Offsets } from '@lib/geometry/Offsets';
import { shuffle } from '@lib/utils/random';

const generateTiles = (
  width: number,
  height: number,
  regions: RoomRegion[],
  connections: Connection[],
  emptyRegionConnections: EmptyRegionConnection[]
): TileType[][] => {
  const tiles: TileType[][] = [];
  for (let y = 0; y < height; y++) {
    const row: TileType[] = [];
    for (let x = 0; x < width; x++) {
      row.push(TileType.NONE);
    }
    tiles.push(row);
  }

  // add floor tiles for rooms
  for (const region of regions) {
    if (region.roomRect) {
      const { roomRect } = region;
      const { left, top, width, height } = roomRect;
      const right = left + width;
      const bottom = top + height;
      for (let y = top; y < bottom; y++) {
        for (let x = left; x < right; x++) {
          tiles[y][x] = TileType.FLOOR;
        }
      }
    }
  }

  // add floor tiles for connections
  for (const connection of connections) {
    const { startCoordinates, endCoordinates } = connection;
    const { dx, dy } = _pointAt(startCoordinates, endCoordinates);

    let { x, y } = startCoordinates;
    while (!Coordinates.equals({ x, y }, endCoordinates)) {
      tiles[y][x] = TileType.FLOOR_HALL;
      x += dx;
      y += dy;
    }
    tiles[y][x] = TileType.FLOOR_HALL;
  }

  _addTilesForEmptyRegionConnections(tiles, emptyRegionConnections, connections);
  _addWallTiles(tiles);

  return tiles;
};

const _addWallTiles = (tiles: TileType[][]) => {
  const height = tiles.length;
  const width = tiles[0].length;
  for (let y = 0; y < height - 2; y++) {
    for (let x = 0; x < width; x++) {
      const tile = tiles[y][x];
      const oneDown = tiles[y + 1][x];
      const twoDown = tiles[y + 2][x];
      if (
        tile === TileType.NONE &&
        oneDown === TileType.NONE &&
        (twoDown === TileType.FLOOR_HALL || twoDown === TileType.FLOOR)
      ) {
        tiles[y][x] = TileType.WALL_TOP;
        tiles[y + 1][x] = twoDown === TileType.FLOOR ? TileType.WALL : TileType.WALL_HALL;
      }
    }
  }
};

const _addTilesForEmptyRegionConnections = (
  tiles: TileType[][],
  emptyRegionConnections: EmptyRegionConnection[],
  connections: Connection[]
) => {
  for (const connection of emptyRegionConnections) {
    const neighbors = [...connection.neighbors];
    shuffle(neighbors);
    for (let i = 0; i < neighbors.length - 1; i++) {
      const firstNeighbor = connection.neighbors[i];
      const secondNeighbor = connection.neighbors[i + 1];
      const firstConnection =
        connections.find(c =>
          Connection.matches(c, connection.roomRegion, firstNeighbor)
        ) || null;
      const secondConnection =
        connections.find(c =>
          Connection.matches(c, connection.roomRegion, secondNeighbor)
        ) || null;

      if (firstConnection === null || secondConnection === null) {
         
        console.error('Failed to find connection');
        console.log(connections.map(Connection.toString).join(', '));
        console.log(neighbors.join(' '));
        console.log(firstNeighbor.rect);
        console.log(secondNeighbor.rect);
         
        return;
      }

      if (firstConnection.direction !== secondConnection.direction) {
        // join perpendicularly
        _joinPerpendicularly(tiles, firstConnection, secondConnection);
      } else {
        // join parallel connections
        // TODO: This will also try to join U-shaped connections, and doesn't do it correctly!
        // For now, we're just going to run a validation step and regenerate if it fails.
        _joinParallelConnections(tiles, connection, firstConnection, secondConnection);
      }
    }
  }
};

const _joinPerpendicularly = (
  tiles: TileType[][],
  firstConnection: Connection,
  secondConnection: Connection
) => {
  const start = firstConnection.middleCoordinates;
  const end = secondConnection.middleCoordinates;
  const middle = {
    x: (firstConnection.direction === 'VERTICAL' ? start : end).x,
    y: (firstConnection.direction === 'HORIZONTAL' ? start : end).y
  };

  let offsets = _pointAt(start, middle);

  let { x, y } = start;
  while (!Coordinates.equals({ x, y }, middle)) {
    tiles[y][x] = TileType.FLOOR_HALL;
    x += offsets.dx;
    y += offsets.dy;
  }

  offsets = _pointAt(middle, end);
  while (!Coordinates.equals({ x, y }, end)) {
    tiles[y][x] = TileType.FLOOR_HALL;
    x += offsets.dx;
    y += offsets.dy;
  }
};

const _joinParallelConnections = (
  tiles: TileType[][],
  emptyRegionConnection: EmptyRegionConnection,
  firstConnection: Connection,
  secondConnection: Connection
) => {
  const start = firstConnection.middleCoordinates;
  const end = secondConnection.middleCoordinates;
  const middle = {
    x: Math.round((start.x + end.x) / 2),
    y: Math.round((start.y + end.y) / 2)
  };

  const { dx, dy } = _pointAt(start, end);
  const xDistance = end.x - start.x;
  const yDistance = end.y - start.y;

  const majorDirection: SplitDirection =
    Math.abs(xDistance) >= Math.abs(yDistance) ? 'HORIZONTAL' : 'VERTICAL';
  let { x, y } = start;

  switch (majorDirection) {
    case 'HORIZONTAL':
      while (x !== middle.x) {
        tiles[y][x] = TileType.FLOOR_HALL;
        x += dx;
      }
      while (y !== end.y) {
        tiles[y][x] = TileType.FLOOR_HALL;
        y += dy;
      }
      while (x !== end.x) {
        tiles[y][x] = TileType.FLOOR_HALL;
        x += dx;
      }
      break;
    case 'VERTICAL':
      while (y !== middle.y) {
        tiles[y][x] = TileType.FLOOR_HALL;
        y += dy;
      }
      while (x !== end.x) {
        tiles[y][x] = TileType.FLOOR_HALL;
        x += dx;
      }
      while (y !== end.y) {
        tiles[y][x] = TileType.FLOOR_HALL;
        y += dy;
      }
      break;
  }
};

const _pointAt = (first: Coordinates, second: Coordinates): Offsets => ({
  dx: Math.sign(second.x - first.x),
  dy: Math.sign(second.y - first.y)
});

export default {
  generateTiles
};
