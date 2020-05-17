import DungeonGenerator from './DungeonGenerator';
import { MapSection, Rect, TileSet, TileType } from '../../types/types';
import { randChoice, randInt, shuffle } from '../../utils/RandomUtils';

type Direction = 'HORIZONTAL' | 'VERTICAL';

type Section = {
  // these are in absolute coordinates
  rect: Rect,
  roomRect: Rect | null
};

type Connection = {
  start: Section,
  end: Section
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

    // Compute the actual tiles based on section/connection specifications.
    const tiles: TileType[][] = this._renderRoomsAndConnections(sections, [...minimalSpanningTree, optionalConnections], internalConnections);
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
      const splitX = this._getSplitPoint(width);
      const leftWidth = splitX;
      const leftSections = this._generateSections(0, 0, leftWidth, height);
      const rightWidth = width - splitX;
      const rightSections = this._generateSections(splitX, 0, rightWidth, height);
      return [...leftSections, ...rightSections];
    } else if (splitDirection === 'VERTICAL') {
      const splitY = this._getSplitPoint(height);
      const topHeight = splitY;
      const bottomHeight = height - splitY;
      const topSections = this._generateSections(0, 0, width, topHeight);
      const bottomSections = this._generateSections(0, splitY, width, bottomHeight);
      return [...topSections, ...bottomSections];
    } else {

      const rect: Rect = {
        left,
        top,
        width,
        height
      };

      const padding = 1;
      const topPadding = 2;

      const roomRect: Rect = {
        left: left + padding,
        top: top + topPadding,
        width: width - (2 * padding),
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
   * @param dimension width or height
   * @returns the min X/Y coordinate of the *second* room
   */
  private _getSplitPoint(dimension: number): number {
    const minSectionDimension = this._minRoomDimension + 2 * this._minRoomPadding;
    const minSplitPoint = minSectionDimension;
    const maxSplitPoint = dimension - minSectionDimension;
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
    unconnectedSections.forEach(section => {
      shuffle(connectedSections);
      connectedSections.forEach(connectedSection => {
        if (this._canConnect(connectedSection, section)) {
          unconnectedSections.splice(unconnectedSections.indexOf(section), 1);
          connectedSections.push(section);
        }
      });
    });

    return connections;
  }

  private _generateOptionalConnections(sections: Section[], minimalSpanningTree: Connection[]): Connection[] {
    throw 'TODO';
  }

  private _addRedRedConnections(sections: Section[], minimalSpanningTree: Connection[]) {
    throw 'TODO';
  }

  private _addInternalConnections(sections: Section[], minimalSpanningTree: Connection[], optionalConnections: Connection[]): InternalConnection[] {
    throw 'TODO';
  }

  private _renderRoomsAndConnections(sections: Section[], param2: (Connection | Connection[])[], internalConnections: InternalConnection[]): TileType[][] {
    throw 'TODO';
  }

  private _addWalls(tiles: TileType[][]): void {
    throw 'TODO';
  }

  private _canConnect(connectedSection: Section, section: Section): boolean {
    throw 'TODO';
  }
}

export default RoomCorridorDungeonGenerator2;