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
  endCoordinates: Coordinates
};

type InternalConnection = {
  section: Section,
  neighbors: Section[]
}

class RoomCorridorDungeonGenerator2 extends DungeonGenerator {
  private readonly _minRoomDimension: number;
  private readonly _maxRoomDimension: number;
  private readonly _minRoomPadding: number;
  /**
   * @param minRoomDimension outer width, including wall
   * @param maxRoomDimension outer width, including wall
   * @param minRoomPadding minimum padding between each room and its containing section
   */
  constructor(tileSet: TileSet, minRoomDimension: number, maxRoomDimension: number, minRoomPadding: number) {
    super(tileSet);
    this._minRoomDimension = minRoomDimension;
    this._maxRoomDimension = maxRoomDimension;
    this._minRoomPadding = minRoomPadding;
  }

  protected generateTiles(width: number, height: number): MapSection {
    // 1. Recursively subdivide the map into sections.
    //    Each section must fall within the max dimensions.
    // 2. Add rooms within sections, with appropriate padding.
    //    (Don't add a room for every section; approximately half.  Rules TBD.)
    const sections : Section[] = this._generateSections(0, 0, width, height);
    //this._removeRooms(sections);

    // 3. Construct a minimal spanning tree between sections (including those without rooms).
    const minimalSpanningTree: Connection[] = this._generateMinimalSpanningTree(sections);
    // 4.  Add all optional connections between sections.
    const optionalConnections: Connection[] = this._generateOptionalConnections(sections, minimalSpanningTree);
    // 5. Add "red-red" connections in empty rooms.
    // 6. Add "red-green" connections in empty rooms only if:
    //    - both edges connect to a room
    //    - there is no red-red connection in the section
    const internalConnections: InternalConnection[] = this._addInternalConnections(sections, minimalSpanningTree, optionalConnections);

    // TODO
    const debugOutput = `
      Sections: ${sections.map(section => `(${section.rect.left}, ${section.rect.top}, ${section.rect.width}, ${section.rect.height})`).join('; ')}\n
      MST: ${minimalSpanningTree.map(connection => `((${connection.startCoordinates.x}, ${connection.startCoordinates.y})-(${connection.endCoordinates.x}, ${connection.endCoordinates.y}))`).join('; ')},
      opt: ${optionalConnections.map(connection => `((${connection.startCoordinates.x}, ${connection.startCoordinates.y})-(${connection.endCoordinates.x}, ${connection.endCoordinates.y}))`).join('; ')}
    `;

    console.log(debugOutput);
    // END TODO

    // Compute the actual tiles based on section/connection specifications.
    const tiles: TileType[][] = this._generateTiles(width, height, sections, [...minimalSpanningTree, ...optionalConnections], internalConnections);

    // 7. Add walls.
    this._addWalls(tiles);

    return {
      tiles,
      rooms: [], // TODO
      width,
      height
    };
  }

  /**
   * Generate a rectangular area of tiles with the specified dimensions, consisting of any number of rooms connected
   * by corridors.  To do so, split the area into two sub-areas and call this method recursively.  If this area is
   * not large enough to form two sub-regions, just return a single section.
   */
  private _generateSections(left: number, top: number, width: number, height: number): Section[] {
    const splitDirection = this._getSplitDirection(width, height);
    if (splitDirection === 'HORIZONTAL') {
      const splitX = this._getSplitPoint(left, width);
      const leftWidth = splitX;
      const leftSections = this._generateSections(left, top, leftWidth, height);
      const rightWidth = width - splitX;
      const rightSections = this._generateSections(splitX, top, rightWidth, height);
      return [...leftSections, ...rightSections];
    } else if (splitDirection === 'VERTICAL') {
      const splitY = this._getSplitPoint(top, height);
      const topHeight = splitY;
      const bottomHeight = height - splitY;
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
    const minSectionDimension = this._minRoomDimension + (2 * this._minRoomPadding);
    const canSplitHorizontally = (width >= (2 * minSectionDimension));
    const canSplitVertically = (height >= (2 * minSectionDimension));

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
  private _getSplitPoint(start: number, dimension: number): number {
    const minSectionDimension = this._minRoomDimension + 2 * this._minRoomPadding;
    const minSplitPoint = start + minSectionDimension;
    const maxSplitPoint = start + dimension - minSectionDimension;
    return randInt(minSplitPoint, maxSplitPoint);
  }

  private _removeRooms(sections: Section[]): void {
    const minRooms = 3;
    const maxRooms = Math.max(sections.length - 1, minRooms);
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
          } else {
            console.log('can\'t connect:');
            console.log(connectedSection);
            console.log(unconnectedSection);
          }
        }
      }

      if (!connectedAny) {
        console.log('connected:');
        connectedSections.forEach(x => console.log(x));
        console.log('unconnected:');
        unconnectedSections.forEach(x => console.log(x));
        console.error('fux');
        //throw 'fux';
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

  private _addInternalConnections(sections: Section[], spanningConnections: Connection[], optionalConnections: Connection[]): InternalConnection[] {
    const internalConnections: InternalConnection[] = [];
    sections.forEach(section => {
      if (!section.roomRect) {
        const connectedSections: Section[] = [];
        sections.forEach(otherSection => {
          if (!spanningConnections.some(connection => this._connectionMatches(connection, section, otherSection))) {
            connectedSections.push(otherSection);
          }
        });

        internalConnections.push({ section, neighbors: connectedSections });
      }
    });

    return internalConnections;
  }

  private _generateTiles(width: number, height: number, sections: Section[], connections: Connection[],
                         internalConnections: InternalConnection[]): TileType[][] {
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

    return tiles;
  }

  private _addWalls(tiles: TileType[][]): void {
    //throw 'TODO';
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
      console.error('fux2');
      throw 'fux2';
    }

    return {
      start: first,
      end: second,
      startCoordinates: firstCoordinates,
      endCoordinates: secondCoordinates
    };
  }
}

export default RoomCorridorDungeonGenerator2;