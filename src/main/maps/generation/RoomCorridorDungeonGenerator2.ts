import DungeonGenerator from './DungeonGenerator';
import { Coordinates, MapSection, Rect, TileSet, TileType } from '../../types/types';
import { randChoice, randInt, shuffle } from '../../utils/RandomUtils';
import { areAdjacent, coordinatesEquals } from '../MapUtils';

type Direction = 'HORIZONTAL' | 'VERTICAL';

type Section = {
  // these are in absolute coordinates
  rect: Rect,
  roomRect: Rect | null
};

type Connection = {
  start: Section,
  end: Section,
  startCoordinates: Coordinates,
  endCoordinates: Coordinates,
  middleCoordinates: Coordinates,
  direction: Direction
};

type InternalConnection = {
  section: Section,
  neighbors: Section[]
}

const ROOM_PADDING = [2, 3, 1, 1]; // left, top, right, bottom;
const MIN_ROOM_FRACTION = 0.25;
const MAX_ROOM_FRACTION = 0.75;

class RoomCorridorDungeonGenerator2 extends DungeonGenerator {
  private readonly _minRoomDimension: number;
  private readonly _maxRoomDimension: number;
  /**
   * @param minRoomDimension inner width, not including wall
   * @param maxRoomDimension inner width, not including wall
   */
  constructor(tileSet: TileSet, minRoomDimension: number, maxRoomDimension: number) {
    super(tileSet);
    this._minRoomDimension = minRoomDimension;
    this._maxRoomDimension = maxRoomDimension;
  }

  protected generateTiles(width: number, height: number): MapSection {
    // 1. Recursively subdivide the map into sections.
    //    Each section must fall within the max dimensions.
    // 2. Add rooms within sections, with appropriate padding.
    //    (Don't add a room for every section; approximately half.  Rules TBD.)
    const sections : Section[] = this._generateSections(0, 0, width, height);
    this._removeRooms(sections);

    // 3. Construct a minimal spanning tree between sections (including those without rooms).
    const minimalSpanningTree: Connection[] = this._generateMinimalSpanningTree(sections);
    // 4.  Add all optional connections between sections.
    const optionalConnections: Connection[] = this._generateOptionalConnections(sections, minimalSpanningTree);
    // 5. Add "red-red" connections in empty rooms.
    // 6. Add "red-green" connections in empty rooms only if:
    //    - both edges connect to a room
    //    - there is no red-red connection in the section
    const internalConnections: InternalConnection[] = this._addInternalConnections(sections, minimalSpanningTree, optionalConnections);

    const externalConnections = [...minimalSpanningTree, ...optionalConnections];
    this._stripOrphanedConnections(externalConnections, internalConnections);

    // TODO
    const debugOutput = `
      Sections: ${sections.map(section => this._sectionToString(section)).join('; ')}
      MST: ${minimalSpanningTree.map(this._connectionToString).join('; ')}
      opt: ${optionalConnections.map(this._connectionToString).join('; ')}
      external: ${externalConnections.map(this._connectionToString).join('; ')}
      Internal: ${internalConnections.map(connection => `${this._sectionToString(connection.section)}, ${connection.neighbors.length}`).join('; ')}
    `;

    console.log(debugOutput);
    // END TODO

    // Compute the actual tiles based on section/connection specifications.
    const tiles: TileType[][] = this._generateTiles(width, height, sections, externalConnections, internalConnections);

    // 7. Add walls.
    this._addWalls(tiles);

    return {
      tiles,
      rooms: [], // TODO
      width,
      height
    };
  }

  private _sectionToString(section: Section) {
    return `(${section.rect.left}, ${section.rect.top}, ${section.rect.width}, ${section.rect.height})`;
  }

  /**
   * Generate a rectangular area of tiles with the specified dimensions, consisting of any number of rooms connected
   * by corridors.  To do so, split the area into two sub-areas and call this method recursively.  If this area is
   * not large enough to form two sub-regions, just return a single section.
   */
  private _generateSections(left: number, top: number, width: number, height: number): Section[] {
    const splitDirection = this._getSplitDirection(width, height);
    if (splitDirection === 'HORIZONTAL') {
      const splitX = this._getSplitPoint(left, width, splitDirection);
      const leftWidth = splitX - left;
      const leftSections = this._generateSections(left, top, leftWidth, height);
      const rightWidth = width - leftWidth;
      const rightSections = this._generateSections(splitX, top, rightWidth, height);
      return [...leftSections, ...rightSections];
    } else if (splitDirection === 'VERTICAL') {
      const splitY = this._getSplitPoint(top, height, splitDirection);
      const topHeight = splitY - top;
      const bottomHeight = height - topHeight;
      const topSections = this._generateSections(left, top, width, topHeight);
      const bottomSections = this._generateSections(left, splitY, width, bottomHeight);
      return [...topSections, ...bottomSections];
    } else {
      // base case: generate single section
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
  }

  private _getSplitDirection(width: number, height: number): Direction | null {
    // First, make sure the area is large enough to support two sections; if not, we're done
    const minWidth = this._minRoomDimension + ROOM_PADDING[0] + ROOM_PADDING[2];
    const minHeight = this._minRoomDimension + ROOM_PADDING[1] + ROOM_PADDING[3];
    const canSplitHorizontally = (width >= (2 * minWidth));
    const canSplitVertically = (height >= (2 * minHeight));

    if (canSplitHorizontally) {
      return 'HORIZONTAL';
    } else if (canSplitVertically) {
      return 'VERTICAL';
    } else {
      return null;
    }
  }

  /**
   * @param start left or top
   * @param dimension width or height
   * @returns the min X/Y coordinate of the *second* room
   */
  private _getSplitPoint(start: number, dimension: number, direction: Direction): number {
    const minWidth = this._minRoomDimension + ROOM_PADDING[0] + ROOM_PADDING[2];
    const minHeight = this._minRoomDimension + ROOM_PADDING[1] + ROOM_PADDING[3];
    const minSectionDimension = (direction === 'HORIZONTAL' ? minWidth : minHeight);
    const minSplitPoint = start + minSectionDimension;
    const maxSplitPoint = start + dimension - minSectionDimension;
    return randInt(minSplitPoint, maxSplitPoint);
  }

  private _removeRooms(sections: Section[]): void {
    const minRooms = Math.max(3, Math.round(sections.length * MIN_ROOM_FRACTION));
    const maxRooms = Math.max(minRooms, sections.length * MAX_ROOM_FRACTION);
    if (sections.length < minRooms) {
      throw 'Not enough sections';
    }

    const numRooms = randInt(minRooms, maxRooms);

    const shuffledSections = [...sections];
    shuffle(shuffledSections);
    for (let i = numRooms; i < shuffledSections.length; i++) {
      shuffledSections[i].roomRect = null;
    }
  }

  private _generateMinimalSpanningTree(sections: Section[]): Connection[] {
    const connectedSection = randChoice(sections);
    const connectedSections = [connectedSection];
    const unconnectedSections = [...sections].filter(section => section !== connectedSection);
    shuffle(unconnectedSections);

    const connections : Connection[] = [];
    while (unconnectedSections.length > 0) {
      shuffle(connectedSections);
      let connectedAny = false;
      for (let i = 0; i < connectedSections.length; i++) {
        const connectedSection = connectedSections[i];

        for (let j = 0; j < unconnectedSections.length; j++) {
          const unconnectedSection = unconnectedSections[j];
          if (this._canConnect(connectedSection, unconnectedSection)) {
            unconnectedSections.splice(j, 1);
            connectedSections.push(unconnectedSection);
            connections.push(this._buildConnection(connectedSection, unconnectedSection));
            connectedAny = true;
            break;
          }
        }
      }

      if (!connectedAny) {
        console.log('connected:');
        connectedSections.forEach(x => console.log(x));
        console.log('unconnected:');
        unconnectedSections.forEach(x => console.log(x));
        'Failed to generate minimal spanning tree';
      }
    }

    return connections;
  }

  private _generateOptionalConnections(sections: Section[], spanningConnections: Connection[]): Connection[] {
    const optionalConnections: Connection[] = [];
    for (let i = 0; i < sections.length; i++) {
      const first = sections[i];
      for (let j = i + 1; j < sections.length; j++) {
        const second = sections[j];
        if (this._canConnect(first, second)) {
          if (!spanningConnections.some(connection => this._connectionMatches(connection, first, second))) {
            optionalConnections.push(this._buildConnection(first, second));
          }
        }
      }
    }

    return optionalConnections;
  }

  private _addInternalConnections(
    sections: Section[],
    spanningConnections: Connection[],
    optionalConnections: Connection[]
  ): InternalConnection[] {
    const internalConnections: InternalConnection[] = [];
    sections.forEach(section => {
      if (!section.roomRect) {
        const connectedSections: Section[] = [];
        const neighbors = sections.filter(s => s !== section).filter(s => this._canConnect(section, s));
        neighbors.forEach(neighbor => {
          if (spanningConnections.some(connection => this._connectionMatches(connection, section, neighbor))) {
            connectedSections.push(neighbor);
          }
        });
        if (connectedSections.length === 1) {
          shuffle(neighbors);
          for (let neighbor of neighbors) {
            if (optionalConnections.some(connection => this._connectionMatches(connection, section, neighbor))) {
              connectedSections.push(neighbor);
              break;
            }
          }
        }
        if (connectedSections.length > 0) {
          internalConnections.push({ section, neighbors: connectedSections });
        }
      }
    });

    return internalConnections;
  }

  private _generateTiles(
    width: number,
    height: number,
    sections: Section[],
    connections: Connection[],
    internalConnections: InternalConnection[]
  ): TileType[][] {
    const tiles: TileType[][] = [];
    for (let y = 0; y < height; y++) {
      const row: TileType[] = [];
      for (let x = 0; x < width; x++) {
        row.push(TileType.NONE);
      }
      tiles.push(row);
    }

    // add floor tiles for rooms
    sections.forEach(section => {
      if (!!section.roomRect) {
        for (let y = section.roomRect.top; y < section.roomRect.top + section.roomRect.height; y++) {
          for (let x = section.roomRect.left; x < section.roomRect.left + section.roomRect.width; x++) {
            tiles[y][x] = TileType.FLOOR;
          }
        }
      }
    });

    // add floor tiles for connections
    connections.forEach(connection => {
      const dx = Math.sign(connection.endCoordinates.x - connection.startCoordinates.x);
      const dy = Math.sign(connection.endCoordinates.y - connection.startCoordinates.y);

      let { x, y } = connection.startCoordinates;
      while (!coordinatesEquals({ x, y }, connection.endCoordinates)) {
        tiles[y][x] = TileType.FLOOR_HALL;
        x += dx;
        y += dy;
      }
      tiles[y][x] = TileType.FLOOR_HALL;
    });

    this._addTilesForInternalConnections(tiles, internalConnections, connections);

    return tiles;
  }

  private _addWalls(tiles: TileType[][]): void {
    const height = tiles.length;
    const width = tiles[0].length;
    for (let y = 0; y < height - 2; y++) {
      for (let x = 0; x < width; x++) {
        if (
          tiles[y][x] === TileType.NONE
          && tiles[y + 1][x] === TileType.NONE
          && (tiles[y + 2][x] === TileType.FLOOR || tiles[y + 2][x] === TileType.FLOOR_HALL)
        ) {
          tiles[y][x] = TileType.WALL_TOP;
          tiles[y + 1][x] = (tiles[y + 2][x] === TileType.FLOOR) ? TileType.WALL : TileType.WALL_HALL;
        }
      }
    }
  }

  private _canConnect(first: Section, second: Section): boolean {
    return areAdjacent(first.rect, second.rect, 5);
  }

  private _connectionMatches(connection: Connection, first: Section, second: Section) {
    // ref. equality should be fine
    if (connection.start === first && connection.end === second) {
      return true;
    } else if (connection.start === second && connection.end === first) {
      return true;
    } else {
      return false;
    }
  }

  private _buildConnection(first: Section, second: Section): Connection {
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
    }
    else {
      throw 'Failed to build connection';
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
  }

  private _connectionToString(connection: Connection) {
    return `[(${connection.startCoordinates.x}, ${connection.startCoordinates.y})-(${connection.endCoordinates.x}, ${connection.endCoordinates.y})]`;
  }

  private _addTilesForInternalConnections(tiles: TileType[][], internalConnections: InternalConnection[], connections: Connection[]) {
    internalConnections.forEach(internalConnection => {
      const neighbors = [...internalConnection.neighbors];
      shuffle(neighbors);
      for (let i = 0; i < neighbors.length - 1; i++) {
        const firstNeighbor = internalConnection.neighbors[i];
        const secondNeighbor = internalConnection.neighbors[i + 1];
        const firstConnection = connections.filter(c => this._connectionMatches(c, internalConnection.section, firstNeighbor))[0];
        const secondConnection = connections.filter(c => this._connectionMatches(c, internalConnection.section, secondNeighbor))[0];

        if (!firstConnection || !secondConnection) {
          console.error('fux3');
          console.log(connections.map(this._connectionToString).join(', '));
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
    });
  }

  private _joinPerpendicularly(tiles: TileType[][], firstConnection: Connection, secondConnection: Connection) {
    const start = firstConnection.middleCoordinates;
    const end = secondConnection.middleCoordinates;
    const middle = {
      x: ((firstConnection.direction === 'VERTICAL') ? start : end).x,
      y: ((firstConnection.direction === 'HORIZONTAL') ? start : end).y
    };

    let dx = Math.sign(middle.x - start.x);
    let dy = Math.sign(middle.y - start.y);

    let { x, y } = start;
    while (!coordinatesEquals({ x, y }, middle)) {
      tiles[y][x] = TileType.FLOOR_HALL;
      x += dx;
      y += dy;
    }

    dx = Math.sign(end.x - middle.x);
    dy = Math.sign(end.y - middle.y);
    while (!coordinatesEquals({ x, y }, end)) {
      tiles[y][x] = TileType.FLOOR_HALL;
      x += dx;
      y += dy;
    }
  }

  private _joinParallelConnections(tiles: TileType[][], internalConnection: InternalConnection, firstConnection: Connection, secondConnection: Connection) {
    const start = firstConnection.middleCoordinates;
    const end = secondConnection.middleCoordinates;
    const middle = {
      x: Math.round((start.x + end.x) / 2),
      y: Math.round((start.y + end.y) / 2)
    };

    const xDistance = end.x - start.x;
    const yDistance = end.y - start.y;
    const dx = Math.sign(xDistance);
    const dy = Math.sign(yDistance);

    const majorDirection: Direction = (Math.abs(xDistance) >= Math.abs(yDistance)) ? 'HORIZONTAL' : 'VERTICAL';
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
  }

  /**
   * A connection is orphaned if, for either of its endpoints, there is neither a room nor a connected
   * internal connection that connects to that endpoint.
   *
   * @return a copy of `externalConnections` with the desired elements removed
   */
  private _stripOrphanedConnections(
    externalConnections: Connection[],
    internalConnections: InternalConnection[]
  ) {
    let removedAnyConnections = false;
    do {
      const orphanedConnections = externalConnections.filter(connection => {
        return this._isOrphanedConnection(connection, internalConnections);
      });

      this._subtract(externalConnections, orphanedConnections);

      internalConnections.forEach(internalConnection => {
        this._pruneInternalConnection(internalConnection, orphanedConnections);
      });

      const orphanedInternalConnections = internalConnections.filter(internalConnection => {
        return this._isOrphanedInternalConnection(internalConnection, internalConnections);
      });
      this._subtract(internalConnections, orphanedInternalConnections);

      removedAnyConnections = (orphanedConnections.length > 0 || orphanedInternalConnections.length > 0);
      console.log(`stripping: ${orphanedConnections.length}, ${orphanedInternalConnections.length}`);
    } while (removedAnyConnections);
  }

  private _isOrphanedConnection(connection: Connection, internalConnections: InternalConnection[]) {
    const { start, end } = connection;
    let startHasInternalConnection = false;
    let endHasInternalConnection = false;

    for (let internalConnection of internalConnections) {
      if (internalConnection.section === start && internalConnection.neighbors.indexOf(end) > -1) {
        startHasInternalConnection = true;
      }
      if (internalConnection.section === end && internalConnection.neighbors.indexOf(start) > -1) {
        endHasInternalConnection = true;
      }
    }

    return !(
      (!!start.roomRect || startHasInternalConnection)
      && (!!end.roomRect || endHasInternalConnection)
    );
  }

  private _pruneInternalConnection(internalConnection: InternalConnection, orphanedConnections: Connection[]) {
    for (let connection of orphanedConnections) {
      const { section, neighbors } = internalConnection;
      const { start, end } = connection;
      const updatedNeighbors: Section[] = neighbors.filter(neighbor => {
        if (section === start && neighbor === end) {
          return false;
        }
        if (section === end && neighbor === start) {
          return false;
        }
        return true;
      });
      this._replace(neighbors, updatedNeighbors);
    }
  }

  /**
   * An internal connection is orphaned if at most one of its neighbors has either a room or another
   * internal connection
   */
  private _isOrphanedInternalConnection(internalConnection: InternalConnection, internalConnections: InternalConnection[]) {
    let connectedNeighbors = 0;
    const { section, neighbors } = internalConnection;
    neighbors.forEach(neighbor => {
      const neighborHasInternalConnection = internalConnections.find(other => other.section === neighbor && other.neighbors.indexOf(section) > -1);
      if (!!neighbor.roomRect || neighborHasInternalConnection) {
        connectedNeighbors++;
      }
    });
    return connectedNeighbors <= 1;
  }

  private _replace<T>(array: T[], contents: T[]) {
    array.splice(0, array.length);
    array.push(...contents);
  }

  private _subtract<T>(array: T[], toRemove: T[]) {
    const updated = array.filter(element => toRemove.indexOf(element) === -1);
    this._replace(array, updated);
  }
}

export default RoomCorridorDungeonGenerator2;