import Coordinates from '../../geometry/Coordinates';
import TileSet from '../../tiles/TileSet';
import TileType from '../../tiles/TileType';
import { Offsets, Rect } from '../../types/types';
import { replace, subtract } from '../../utils/arrays';
import { checkState } from '../../utils/preconditions';
import { randChoice, randInt, shuffle } from '../../utils/random';
import { areAdjacent } from '../MapUtils';
import EmptyRegionConnection from './  EmptyRegionConnection';
import Connection from './Connection';
import AbstractMapGenerator from './AbstractMapGenerator';
import EmptyMap from './EmptyMap';
import RoomRegion from './RoomRegion';
import SplitDirection from './SplitDirection';

type Props = {
  tileSet: TileSet,
  minRoomDimension: number,
  maxRoomDimension: number
};

const ROOM_PADDING = [2, 3, 1, 1]; // left, top, right, bottom
const MIN_ROOM_FRACTION = 0.4;
const MAX_ROOM_FRACTION = 0.8;

class RoomCorridorMapGenerator2 extends AbstractMapGenerator {
  /**
   * inner width, not including wall
   */
  private readonly minRoomDimension: number;
  /**
   * inner width, not including wall
   */
  private readonly maxRoomDimension: number;

  constructor({ tileSet, minRoomDimension, maxRoomDimension }: Props) {
    super(tileSet);
    this.minRoomDimension = minRoomDimension;
    this.maxRoomDimension = maxRoomDimension;
  }

  /**
   * @override {@link AbstractMapGenerator#generateTiles}
   */
  protected generateTiles = (width: number, height: number): EmptyMap => {
    // 1. Recursively subdivide the map into regions.
    //    Each region must fall within the max dimensions.
    // 2. Add rooms within regions, with appropriate padding.
    //    (Don't add a room for every region; approximately half.  Rules TBD.)
    const regions : RoomRegion[] = this._generateRegions(0, 0, width, height);
    this._removeRooms(regions);

    // 3. Construct a minimal spanning tree between regions (including those without rooms).
    const minimalSpanningTree: Connection[] = this._generateMinimalSpanningTree(regions);
    // 4.  Add all optional connections between regions.
    const optionalConnections: Connection[] = this._generateOptionalConnections(regions, minimalSpanningTree);
    // 5. Add "red-red" connections in empty regions.
    // 6. Add "red-green" connections in empty regions only if:
    //    - both edges connect to a region with a room
    //    - there is no "red-red" connection in the region
    const internalConnections: EmptyRegionConnection[] = this._addEmptyRegionConnections(regions, minimalSpanningTree, optionalConnections);

    const externalConnections = [...minimalSpanningTree, ...optionalConnections];
    this._stripOrphanedConnections(externalConnections, internalConnections);

    const debugOutput = `
      Room regions: ${regions.map(RoomRegion.toString).join('; ')}
      MST: ${minimalSpanningTree.map(Connection.toString).join('; ')}
      opt: ${optionalConnections.map(Connection.toString).join('; ')}
      external: ${externalConnections.map(Connection.toString).join('; ')}
      Internal: ${internalConnections.map(connection => `${RoomRegion.toString(connection.roomRegion)}, ${connection.neighbors.length}`).join('; ')}
    `;

    console.debug(debugOutput);

    // Compute the actual tiles based on region/connection specifications.
    const tiles: TileType[][] = this._generateTiles(width, height, regions, externalConnections, internalConnections);

    // 7. Add walls.
    this._addWalls(tiles);

    return {
      tiles,
      rooms: [], // TODO
      width,
      height
    };
  };

  /**
   * Generate a rectangular area of tiles with the specified dimensions, consisting of any number of rooms connected
   * by corridors.  To do so, split the area into two sub-regions and call this method recursively.  If this area is
   * not large enough to form two sub-regions, just return a single region.
   */
  private _generateRegions = (left: number, top: number, width: number, height: number): RoomRegion[] => {
    const splitDirection = this._getSplitDirection(width, height);
    switch (splitDirection) {
      case 'HORIZONTAL':
        const splitX = this._getSplitPoint(left, width, splitDirection);
        const leftWidth = splitX - left;
        const leftRegions = this._generateRegions(left, top, leftWidth, height);
        const rightWidth = width - leftWidth;
        const rightRegions = this._generateRegions(splitX, top, rightWidth, height);
        return [...leftRegions, ...rightRegions];
      case 'VERTICAL':
        const splitY = this._getSplitPoint(top, height, splitDirection);
        const topHeight = splitY - top;
        const bottomHeight = height - topHeight;
        const topRegions = this._generateRegions(left, top, width, topHeight);
        const bottomRegions = this._generateRegions(left, splitY, width, bottomHeight);
        return [...topRegions, ...bottomRegions];
      default:
        // base case: generate single region
        const rect: Rect = {
          left,
          top,
          width,
          height
        };

        const padding = 1;
        const leftPadding = 2;
        const topPadding = 2;

        const roomRect: Rect = {
          left: left + leftPadding,
          top: top + topPadding,
          width: width - padding - leftPadding,
          height: height - padding - topPadding
        };

        return [{ rect, roomRect }];
    }
  };

  private _getSplitDirection = (width: number, height: number): SplitDirection | null => {
    // First, make sure the area is large enough to support two regions; if not, we're done
    const minWidth = this.minRoomDimension + ROOM_PADDING[0] + ROOM_PADDING[2];
    const minHeight = this.minRoomDimension + ROOM_PADDING[1] + ROOM_PADDING[3];
    const canSplitHorizontally = (width >= (2 * minWidth));
    const canSplitVertically = (height >= (2 * minHeight));

    if (canSplitHorizontally) {
      return 'HORIZONTAL';
    } else if (canSplitVertically) {
      return 'VERTICAL';
    } else {
      return null;
    }
  };

  /**
   * @param start left or top
   * @param dimension width or height
   * @returns the min X/Y coordinate of the *second* room
   */
  private _getSplitPoint = (start: number, dimension: number, direction: SplitDirection): number => {
    const minWidth = this.minRoomDimension + ROOM_PADDING[0] + ROOM_PADDING[2];
    const minHeight = this.minRoomDimension + ROOM_PADDING[1] + ROOM_PADDING[3];
    const minRegionDimension = (direction === 'HORIZONTAL' ? minWidth : minHeight);
    const minSplitPoint = start + minRegionDimension;
    const maxSplitPoint = start + dimension - minRegionDimension;
    return randInt(minSplitPoint, maxSplitPoint);
  };

  private _removeRooms = (regions: RoomRegion[]) => {
    const minRooms = Math.max(3, Math.round(regions.length * MIN_ROOM_FRACTION));
    const maxRooms = Math.max(minRooms, regions.length * MAX_ROOM_FRACTION);
    checkState(regions.length >= minRooms, 'Not enough regions');

    const numRooms = randInt(minRooms, maxRooms);

    const shuffledRegions = [...regions];
    shuffle(shuffledRegions);
    for (let i = numRooms; i < shuffledRegions.length; i++) {
      shuffledRegions[i].roomRect = null;
    }
  };

  private _generateMinimalSpanningTree = (regions: RoomRegion[]): Connection[] => {
    const connectedRegions = [randChoice(regions)];
    const unconnectedRegions = regions.filter(region => !connectedRegions.includes(region));
    shuffle(unconnectedRegions);

    const connections : Connection[] = [];
    while (unconnectedRegions.length > 0) {
      shuffle(connectedRegions);
      let connectedAny = false;
      for (const connectedRegion of connectedRegions) {
        for (let j = 0; j < unconnectedRegions.length; j++) {
          const unconnectedRegion = unconnectedRegions[j];
          if (this._canConnect(connectedRegion, unconnectedRegion)) {
            unconnectedRegions.splice(j, 1);
            connectedRegions.push(unconnectedRegion);
            connections.push(this._buildConnection(connectedRegion, unconnectedRegion));
            connectedAny = true;
            break;
          }
        }
      }

      if (!connectedAny) {
        console.log('connected:');
        connectedRegions.forEach(x => console.log(x));
        console.log('unconnected:');
        unconnectedRegions.forEach(x => console.log(x));
        throw new Error('Failed to generate minimal spanning tree');
      }
    }

    return connections;
  };

  private _generateOptionalConnections = (regions: RoomRegion[], spanningConnections: Connection[]): Connection[] => {
    const optionalConnections: Connection[] = [];
    for (const first of regions) {
      for (const second of regions) {
        if (this._canConnect(first, second)) {
          if (!spanningConnections.some(connection => Connection.matches(connection, first, second))) {
            optionalConnections.push(this._buildConnection(first, second));
          }
        }
      }
    }

    return optionalConnections;
  };

  private _addEmptyRegionConnections = (
    roomRegions: RoomRegion[],
    spanningConnections: Connection[],
    optionalConnections: Connection[]
  ): EmptyRegionConnection[] => {
    const internalConnections: EmptyRegionConnection[] = [];
    for (const roomRegion of roomRegions) {
      if (!roomRegion.roomRect) {
        const connectedRegions: RoomRegion[] = [];
        const neighbors = roomRegions.filter(s => s !== roomRegion)
          .filter(s => this._canConnect(roomRegion, s));
        for (const neighbor of neighbors) {
          if (spanningConnections.some(connection => Connection.matches(connection, roomRegion, neighbor))) {
            connectedRegions.push(neighbor);
          }
        }
        if (connectedRegions.length === 1) {
          shuffle(neighbors);
          for (const neighbor of neighbors) {
            if (optionalConnections.some(connection => Connection.matches(connection, roomRegion, neighbor))) {
              connectedRegions.push(neighbor);
              break;
            }
          }
        }
        if (connectedRegions.length > 0) {
          internalConnections.push({ roomRegion, neighbors: connectedRegions });
        }
      }
    }

    return internalConnections;
  };

  private _generateTiles = (
    width: number,
    height: number,
    regions: RoomRegion[],
    connections: Connection[],
    internalConnections: EmptyRegionConnection[]
  ): TileType[][] => {
    const tiles: TileType[][] = [];
    for (let y = 0; y < height; y++) {
      const row: TileType[] = [];
      for (let x = 0; x < width; x++) {
        row.push('NONE');
      }
      tiles.push(row);
    }

    // add floor tiles for rooms
    for (const region of regions) {
      if (region.roomRect) {
        for (let y = region.roomRect.top; y < region.roomRect.top + region.roomRect.height; y++) {
          for (let x = region.roomRect.left; x < region.roomRect.left + region.roomRect.width; x++) {
            tiles[y][x] = 'FLOOR';
          }
        }
      }
    }

    // add floor tiles for connections
    for (const connection of connections) {
      const { startCoordinates, endCoordinates } = connection;
      const { dx, dy } = this._pointAt(startCoordinates, endCoordinates);

      let { x, y } = startCoordinates;
      while (!Coordinates.equals({ x, y }, endCoordinates)) {
        tiles[y][x] = 'FLOOR_HALL';
        x += dx;
        y += dy;
      }
      tiles[y][x] = 'FLOOR_HALL';
    }

    this._addTilesForInternalConnections(tiles, internalConnections, connections);

    return tiles;
  };

  private _addWalls = (tiles: TileType[][]) => {
    const height = tiles.length;
    const width = tiles[0].length;
    for (let y = 0; y < height - 2; y++) {
      for (let x = 0; x < width; x++) {
        if (
          tiles[y][x] === 'NONE'
          && tiles[y + 1][x] === 'NONE'
          && (tiles[y + 2][x] === 'FLOOR' || tiles[y + 2][x] === 'FLOOR_HALL')
        ) {
          tiles[y][x] = 'WALL_TOP';
          tiles[y + 1][x] = (tiles[y + 2][x] === 'FLOOR') ? 'WALL' : 'WALL_HALL';
        }
      }
    }
  };

  private _canConnect = (first: RoomRegion, second: RoomRegion): boolean =>
    areAdjacent(first.rect, second.rect, 5);

  private _buildConnection = (first: RoomRegion, second: RoomRegion): Connection => {
    let connectionPoint : Coordinates; // on the starting edge of `second`
    let firstCoordinates: Coordinates;
    let secondCoordinates: Coordinates;
    // right-left
    if (first.rect.left + first.rect.width === second.rect.left) {
      const top = Math.max(first.rect.top, second.rect.top);
      const bottom = Math.min(first.rect.top + first.rect.height, second.rect.top + second.rect.height); // exclusive
      connectionPoint = {
        x: second.rect.left,
        y: randInt(top + 2, bottom - 2) // should be in range since we checked _canConnect already
      };
      firstCoordinates = { x: connectionPoint.x - 1, y: connectionPoint.y };
      secondCoordinates = { x: connectionPoint.x + 1, y: connectionPoint.y };
    }
    // bottom-top
    else if (first.rect.top + first.rect.height === second.rect.top) {
      const left = Math.max(first.rect.left, second.rect.left);
      const right = Math.min(first.rect.left + first.rect.width, second.rect.left + second.rect.width); // exclusive
      connectionPoint = {
        x: randInt(left + 2, right - 2), // should be in range since we checked _canConnect already
        y: second.rect.top
      };
      firstCoordinates = { x: connectionPoint.x, y: connectionPoint.y - 1 };
      secondCoordinates = { x: connectionPoint.x, y: connectionPoint.y + 1};
    }
    // left-right
    else if (first.rect.left === second.rect.left + second.rect.width) {
      const top = Math.max(first.rect.top, second.rect.top);
      const bottom = Math.min(first.rect.top + first.rect.height, second.rect.top + second.rect.height); // exclusive
      connectionPoint = {
        x: first.rect.left,
        y: randInt(top + 2, bottom - 2) // should be in range since we checked _canConnect already
      };
      firstCoordinates = { x: connectionPoint.x + 1, y: connectionPoint.y };
      secondCoordinates = { x: connectionPoint.x - 1, y: connectionPoint.y };
    }
    // top-bottom
    else if (first.rect.top === second.rect.top + second.rect.height) {
      const left = Math.max(first.rect.left, second.rect.left);
      const right = Math.min(first.rect.left + first.rect.width, second.rect.left + second.rect.width); // exclusive
      connectionPoint = {
        x: randInt(left + 2, right - 2), // should be in range since we checked _canConnect already
        y: first.rect.top
      };
      firstCoordinates = { x: connectionPoint.x, y: connectionPoint.y + 1 };
      secondCoordinates = { x: connectionPoint.x, y: connectionPoint.y - 1};
    } else {
      throw new Error('Failed to build connection');
    }

    const direction = (firstCoordinates.x === secondCoordinates.x) ? 'VERTICAL' : 'HORIZONTAL';
    const middleCoordinates = {
      x: (firstCoordinates.x + secondCoordinates.x) / 2,
      y: (firstCoordinates.y + secondCoordinates.y) / 2
    };

    return {
      start: first,
      end: second,
      startCoordinates: firstCoordinates,
      endCoordinates: secondCoordinates,
      middleCoordinates,
      direction
    };
  };

  private _addTilesForInternalConnections = (tiles: TileType[][], internalConnections: EmptyRegionConnection[], connections: Connection[]) => {
    for (const internalConnection of internalConnections) {
      const neighbors = [...internalConnection.neighbors];
      shuffle(neighbors);
      for (let i = 0; i < neighbors.length - 1; i++) {
        const firstNeighbor = internalConnection.neighbors[i];
        const secondNeighbor = internalConnection.neighbors[i + 1];
        const firstConnection = connections.find(c => Connection.matches(c, internalConnection.roomRegion, firstNeighbor)) || null;
        const secondConnection = connections.find(c => Connection.matches(c, internalConnection.roomRegion, secondNeighbor)) || null;

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
          this._joinPerpendicularly(tiles, firstConnection, secondConnection);
        } else {
          // join parallel connections
          // TODO: This will also try to join U-shaped connections, and doesn't do it correctly!
          // For now, we're just going to run a validation step and regenerate if it fails.
          this._joinParallelConnections(tiles, internalConnection, firstConnection, secondConnection);
        }
      }
    }
  };

  private _joinPerpendicularly = (tiles: TileType[][], firstConnection: Connection, secondConnection: Connection) => {
    const start = firstConnection.middleCoordinates;
    const end = secondConnection.middleCoordinates;
    const middle = {
      x: ((firstConnection.direction === 'VERTICAL') ? start : end).x,
      y: ((firstConnection.direction === 'HORIZONTAL') ? start : end).y
    };

    let { dx, dy } = this._pointAt(start, middle);

    let { x, y } = start;
    while (!Coordinates.equals({ x, y }, middle)) {
      tiles[y][x] = 'FLOOR_HALL';
      x += dx;
      y += dy;
    }

    ({ dx, dy } = this._pointAt(middle, end));
    while (!Coordinates.equals({ x, y }, end)) {
      tiles[y][x] = 'FLOOR_HALL';
      x += dx;
      y += dy;
    }
  };

  private _joinParallelConnections = (tiles: TileType[][], internalConnection: EmptyRegionConnection, firstConnection: Connection, secondConnection: Connection) => {
    const start = firstConnection.middleCoordinates;
    const end = secondConnection.middleCoordinates;
    const middle = {
      x: Math.round((start.x + end.x) / 2),
      y: Math.round((start.y + end.y) / 2)
    };

    const { dx, dy } = this._pointAt(start, end);
    const xDistance = end.x - start.x;
    const yDistance = end.y - start.y;

    const majorDirection: SplitDirection = (Math.abs(xDistance) >= Math.abs(yDistance)) ? 'HORIZONTAL' : 'VERTICAL';
    let { x, y } = start;

    switch (majorDirection) {
      case 'HORIZONTAL':
        while (x !== middle.x) {
          tiles[y][x] = 'FLOOR_HALL';
          x += dx;
        }
        while (y !== end.y) {
          tiles[y][x] = 'FLOOR_HALL';
          y += dy;
        }
        while (x !== end.x) {
          tiles[y][x] = 'FLOOR_HALL';
          x += dx;
        }
        break;
      case 'VERTICAL':
        while (y !== middle.y) {
          tiles[y][x] = 'FLOOR_HALL';
          y += dy;
        }
        while (x !== end.x) {
          tiles[y][x] = 'FLOOR_HALL';
          x += dx;
        }
        while (y !== end.y) {
          tiles[y][x] = 'FLOOR_HALL';
          y += dy;
        }
        break;
    }
  };

  /**
   * A connection is orphaned if, for either of its endpoints, there is neither a room nor a connected
   * internal connection that connects to that endpoint.
   *
   * @return a copy of `externalConnections` with the desired elements removed
   */
  private _stripOrphanedConnections = (externalConnections: Connection[], internalConnections: EmptyRegionConnection[]) => {
    let removedAnyConnections = false;

    do {
      const orphanedConnections = externalConnections.filter(connection => {
        return this._isOrphanedConnection(connection, internalConnections);
      });

      subtract(externalConnections, orphanedConnections);

      for (const internalConnection of internalConnections) {
        this._pruneInternalConnection(internalConnection, orphanedConnections);
      }

      const orphanedInternalConnections = internalConnections.filter(internalConnection =>
        this._isOrphanedInternalConnection(internalConnection, internalConnections));
      subtract(internalConnections, orphanedInternalConnections);

      removedAnyConnections = (orphanedConnections.length > 0 || orphanedInternalConnections.length > 0);
      console.log(`stripping: ${orphanedConnections.length}, ${orphanedInternalConnections.length}`);
    } while (removedAnyConnections);
  };

  private _isOrphanedConnection = (connection: Connection, internalConnections: EmptyRegionConnection[]) => {
    const { start, end } = connection;
    let startHasInternalConnection = false;
    let endHasInternalConnection = false;

    for (const internalConnection of internalConnections) {
      const { roomRegion, neighbors } = internalConnection;
      if (roomRegion === start && neighbors.indexOf(end) > -1) {
        startHasInternalConnection = true;
      }
      if (roomRegion === end && neighbors.indexOf(start) > -1) {
        endHasInternalConnection = true;
      }
    }

    return !(
      (!!start.roomRect || startHasInternalConnection)
      && (!!end.roomRect || endHasInternalConnection)
    );
  };

  private _pruneInternalConnection = (internalConnection: EmptyRegionConnection, orphanedConnections: Connection[]) => {
    for (const connection of orphanedConnections) {
      const { roomRegion, neighbors } = internalConnection;
      const { start, end } = connection;
      const updatedNeighbors: RoomRegion[] = neighbors.filter(neighbor => {
        if (roomRegion === start && neighbor === end) {
          return false;
        }
        if (roomRegion === end && neighbor === start) {
          return false;
        }
        return true;
      });
      replace(neighbors, updatedNeighbors);
    }
  };

  /**
   * An internal connection is orphaned if at most one of its neighbors has either a room or another
   * internal connection
   */
  private _isOrphanedInternalConnection = (internalConnection: EmptyRegionConnection, internalConnections: EmptyRegionConnection[]) => {
    let connectedNeighbors = 0;
    const { roomRegion, neighbors } = internalConnection;
    for (const neighbor of neighbors) {
      const neighborHasInternalConnection = internalConnections.find(other =>
        other.roomRegion === neighbor && other.neighbors.indexOf(roomRegion) > -1);
      if (!!neighbor.roomRect || neighborHasInternalConnection) {
        connectedNeighbors++;
      }
    }
    return connectedNeighbors <= 1;
  };

  private _pointAt = (first: Coordinates, second: Coordinates): Offsets => ({
    dx: Math.sign(second.x - first.x),
    dy: Math.sign(second.y - first.y)
  });
}

export default RoomCorridorMapGenerator2;
