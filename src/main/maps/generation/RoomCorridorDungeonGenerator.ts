import { TileSet } from '../../types/TileFactory';
import DungeonGenerator from './DungeonGenerator';
import Pathfinder from '../../utils/Pathfinder';
import TileEligibilityChecker from './TileEligibilityChecker';
import { CoordinatePair, Coordinates, MapSection, Room, TileType } from '../../types/types';
import { randChoice, randInt, shuffle } from '../../utils/random';
import { sortBy } from '../../utils/ArrayUtils';
import { hypotenuse, isAdjacent, isBlocking } from '../MapUtils';

type RoomPair = [Room, Room]
type SplitDirection = 'HORIZONTAL' | 'VERTICAL' | 'NONE';

/**
 * Based on http://www.roguebasin.com/index.php?title=Basic_BSP_Dungeon_generation
 * TODO can we delete this?
 */
class RoomCorridorDungeonGenerator extends DungeonGenerator {
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
    // Create a section with dimensions (width, height - 1) and then shift it down by one tile.
    // This is so we have room to add a WALL_TOP tile in the top slot if necessary
    const section = (() => {
      const section = this._generateSection(width, height - 1);
      const connectedRoomPairs = this._joinSection(section, [], true);
      this._joinSection(section, connectedRoomPairs, false);
      return this._shiftVertically(section, 1);
    })();

    this._addWalls(section);
    return section;
  }

  /**
   * Generate a rectangular area of tiles with the specified dimensions, consisting of any number of rooms connected
   * by corridors.  To do so, split the area into two sub-areas and call this method recursively.  If this area is
   * not large enough to form two sub-regions, just return a single section.
   */
  private _generateSection(width: number, height: number): MapSection {
    const splitDirection = this._getSplitDirection(width, height);
    if (splitDirection === 'HORIZONTAL') {
      const splitX = this._getSplitPoint(width);
      const leftWidth = splitX;
      const leftSection = this._generateSection(leftWidth, height);
      const rightWidth = width - splitX;
      const rightSection = this._generateSection(rightWidth, height);

      const tiles: TileType[][] = [];
      for (let y = 0; y < leftSection.tiles.length; y++) {
        const row = [...leftSection.tiles[y], ...rightSection.tiles[y]];
        tiles.push(row);
      }
      // rightSection.rooms are relative to its own origin, we need to offset them by rightSection's coordinates
      // relative to this section's coordinates
      const rightRooms = rightSection.rooms
        .map(room => ({ ...room, left: room.left + splitX }));

      return {
        width,
        height,
        rooms: [...leftSection.rooms, ...rightRooms],
        tiles
      };
    } else if (splitDirection === 'VERTICAL') {
      const splitY = this._getSplitPoint(height);
      const topHeight = splitY;
      const bottomHeight = height - splitY;
      const topSection = this._generateSection(width, topHeight);
      const bottomSection = this._generateSection(width, bottomHeight);
      const tiles = [...topSection.tiles, ...bottomSection.tiles];
      const bottomRooms = bottomSection.rooms
        .map(room => ({ ...room, top: room.top + splitY }));
      return {
        width,
        height,
        rooms: [...topSection.rooms, ...bottomRooms],
        tiles
      };
    } else {
      // Base case: return a single section
      return this._generateSingleSection(width, height);
    }
  }

  private _getSplitDirection(width: number, height: number): SplitDirection {
    // First, make sure the area is large enough to support two sections; if not, we're done
    const minSectionDimension = this._minRoomDimension + (2 * this._minRoomPadding);
    const canSplitHorizontally = (width >= (2 * minSectionDimension));
    const canSplitVertically = (height >= (2 * minSectionDimension));

    // @ts-ignore
    const splitDirections: SplitDirection[] = [
      ...(canSplitHorizontally ? ['HORIZONTAL'] : []),
      ...(canSplitVertically ? ['VERTICAL'] : []),
      ...((!canSplitHorizontally && !canSplitVertically) ? ['NONE'] : [])
    ];

    if (splitDirections.length > 0) {
      return randChoice(splitDirections);
    }
    return 'NONE';
  }

  /**
   * Create a rectangular section of tiles, consisting of a room surrounded by empty spaces.  The room can be placed
   * anywhere in the region at random, and can occupy a variable amount of space in the region
   * (within the specified parameters).
   */
  private _generateSingleSection(width: number, height: number): MapSection {
    const maxRoomWidth = Math.min(width - (2 * this._minRoomPadding), this._maxRoomDimension);
    const maxRoomHeight = Math.min(height - (2 * this._minRoomPadding), this._maxRoomDimension);
    console.assert(maxRoomWidth >= this._minRoomDimension && maxRoomHeight >= this._minRoomDimension, 'calculate room dimensions failed');
    const roomWidth = randInt(this._minRoomDimension, maxRoomWidth);
    const roomHeight = randInt(this._minRoomDimension, maxRoomHeight);
    const roomTiles = this._generateRoomTiles(roomWidth, roomHeight);

    const roomLeft = randInt(this._minRoomPadding, width - roomWidth - this._minRoomPadding);
    const roomTop = randInt(this._minRoomPadding, height - roomHeight - this._minRoomPadding);
    const tiles: TileType[][] = [];
    // x, y are relative to the section's origin
    // roomX, roomY are relative to the room's origin
    for (let y = 0; y < height; y++) {
      tiles[y] = [];
      const roomY = y - roomTop;
      for (let x = 0; x < width; x++) {
        const roomX = x - roomLeft;
        if (roomX >= 0 && roomX < roomWidth && roomY >= 0 && roomY < roomHeight) {
          tiles[y][x] = roomTiles[roomY][roomX];
        } else {
          tiles[y][x] = 'NONE';
        }
      }
    }

    const room: Room = {
      left: roomLeft,
      top: roomTop,
      width: roomWidth,
      height: roomHeight,
      exits: []
    };
    return { width, height, rooms: [room], tiles };
  }

  private _generateRoomTiles(width: number, height: number): TileType[][] {
    const tiles: TileType[][] = [];
    for (let y = 0; y < height; y++) {
      tiles[y] = [];
      for (let x = 0; x < width; x++) {
        if (x > 0 && x < (width - 1) && y === 0) {
          tiles[y][x] = 'WALL_TOP';
        } else if (x === 0 || x === (width - 1) || y === 0 || y === (height - 1)) {
          tiles[y][x] = 'WALL';
        } else {
          tiles[y][x] = 'FLOOR';
        }
      }
    }
    return tiles;
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

  private _joinSection(section: MapSection, existingRoomPairs: RoomPair[], logError: boolean): RoomPair[] {
    const connectedRoomPairs: RoomPair[] = [];
    const unconnectedRooms: Room[] = [...section.rooms];
    const connectedRooms: Room[] = [];
    const nextRoom = unconnectedRooms.pop();
    if (!!nextRoom) {
      connectedRooms.push(nextRoom);
    }

    while (unconnectedRooms.length > 0) {
      const candidatePairs: RoomPair[] = connectedRooms
        .flatMap(connectedRoom => unconnectedRooms.map(unconnectedRoom => <RoomPair>[connectedRoom, unconnectedRoom]))
        .filter(([connectedRoom, unconnectedRoom]) => !existingRoomPairs.some(([firstExistingRoom, secondExistingRoom]) => (
          this._coordinatePairEquals([connectedRoom, unconnectedRoom], [firstExistingRoom, secondExistingRoom])
        )))
        .filter(([connectedRoom, unconnectedRoom]) => this._canJoinRooms(connectedRoom, unconnectedRoom));

      shuffle(candidatePairs);

      let joinedAnyRooms = false;
      for (let [connectedRoom, unconnectedRoom] of candidatePairs) {
        if (this._joinRooms(connectedRoom, unconnectedRoom, section)) {
          connectedRoomPairs.push([connectedRoom, unconnectedRoom]);
          unconnectedRooms.splice(unconnectedRooms.indexOf(unconnectedRoom), 1);
          connectedRooms.push(unconnectedRoom);
          joinedAnyRooms = true;
          break;
        }
      }

      if (!joinedAnyRooms) {
        if (logError) {
          console.error('Couldn\'t connect rooms!');
          this._logSections('fux', section);
          debugger;
        }
        break;
      }
    }
    return connectedRoomPairs;
  }

  /**
   * add walls above corridor tiles if possible
   */
  private _addWalls(section: MapSection) {
    for (let y = 0; y < section.height; y++) {
      for (let x = 0; x < section.width; x++) {
        if (y > 0) {
          if (section.tiles[y][x] === 'FLOOR_HALL') {
            if (section.tiles[y - 1][x] === 'NONE' || section.tiles[y - 1][x] === 'WALL') {
              section.tiles[y - 1][x] = 'WALL_HALL';
            }
          }
        }
      }
    }
  }

  private _canJoinRooms(first: Room, second: Room) {
    return (first !== second); // && (first.exits.length < MAX_EXITS) && (second.exits.length < MAX_EXITS);
  }

  private _joinRooms(firstRoom: Room, secondRoom: Room, section: MapSection): boolean {
    const firstExitCandidates = this._getExitCandidates(firstRoom);
    const secondExitCandidates = this._getExitCandidates(secondRoom);
    let exitPairs: CoordinatePair[] = [];
    for (let firstExit of firstExitCandidates) {
      for (let secondExit of secondExitCandidates) {
        exitPairs.push([firstExit, secondExit]);
      }
    }
    exitPairs = sortBy(exitPairs, ([first, second]) => hypotenuse(first, second));

    for (let i = 0; i < exitPairs.length; i++) {
      const [firstExit, secondExit] = exitPairs[i];
      if (this._joinExits(firstExit, secondExit, section)) {
        firstRoom.exits.push(firstExit);
        secondRoom.exits.push(secondExit);
        return true;
      }
    }

    return false;
  }

  private _getExitCandidates(room: Room): Coordinates[] {
    const eligibleSides = ['TOP', 'RIGHT', 'BOTTOM', 'LEFT'];

    const candidates: Coordinates[] = [];
    eligibleSides.forEach(side => {
      switch (side) {
        case 'TOP':
          for (let x = room.left + 1; x < room.left + room.width - 1; x++) {
            candidates.push({ x, y: room.top });
          }
          break;
        case 'RIGHT':
          for (let y = room.top + 1; y < room.top + room.height - 1; y++) {
            candidates.push({ x: room.left + room.width - 1, y });
          }
          break;
        case 'BOTTOM':
          for (let x = room.left + 1; x < room.left + room.width - 1; x++) {
            candidates.push({ x, y: room.top + room.height - 1 });
          }
          break;
        case 'LEFT':
          for (let y = room.top + 1; y < room.top + room.height - 1; y++) {
            candidates.push({ x: room.left, y });
          }
          break;
        default:
          throw `Unknown side ${side}`;
      }
    });

    return candidates.filter(({ x, y }) => !room.exits.some(exit => isAdjacent(exit, { x, y })));
  }

  /**
   * Find a path between the specified exits between rooms.
   */
  private _joinExits(firstExit: Coordinates, secondExit: Coordinates, section: MapSection): boolean {
    const tileChecker = new TileEligibilityChecker();

    const unblockedTiles: Coordinates[] = [];
    for (let y = 0; y < section.height; y++) {
      for (let x = 0; x < section.width; x++) {
        if (!tileChecker.isBlocked({ x, y }, section, [firstExit, secondExit])) {
          unblockedTiles.push({ x, y });
        }
      }
    }

    const tileCostCalculator = (first: Coordinates, second: Coordinates) => this._calculateTileCost(section, first, second);
    const path = new Pathfinder(tileCostCalculator).findPath(firstExit, secondExit, unblockedTiles);
    path.forEach(({ x, y }) => {
      section.tiles[y][x] = 'FLOOR_HALL';
    });

    return (path.length > 0);
  }

  private _calculateTileCost(section: MapSection, first: Coordinates, second: Coordinates) {
    // prefer reusing floor hall tiles
    return (section.tiles[second.y][second.x] === 'FLOOR_HALL') ? 0.5 : 1;
  };

  private _emptyRow(width: number): TileType[] {
    const row: TileType[] = [];
    for (let x = 0; x < width; x++) {
      row.push('NONE');
    }
    return row;
  }

  private _coordinatePairEquals(firstPair: RoomPair, secondPair: RoomPair) {
    // it's ok to use !== here, rooms will be referentially equal
    return (
      (firstPair[0] === secondPair[0] && firstPair[1] === secondPair[1]) ||
      (firstPair[0] === secondPair[1] && firstPair[1] === secondPair[0])
    );
  }

  private _logSections(name: string, ...sections: MapSection[]) {
    console.log(`Sections for ${name}:`);
    sections.forEach(section => console.log(
      section.tiles
        .map(row => row.map(tile => {
          if (isBlocking(tile)) {
            return '#';
          }
          return '.';
        }).join(''))
        .join('\n')
    ));
    console.log();
  }

  private _shiftVertically(section: MapSection, dy: number) {
    return {
      ...section,
      rooms: section.rooms.map(room => ({
        left: room.left,
        top: room.top + dy,
        width: room.width,
        height: room.height,
        exits: room.exits.map(({ x, y }) => ({ x, y: y + dy }))
      })),
      tiles: [this._emptyRow(section.width), ...section.tiles]
    };
  }
}

export default RoomCorridorDungeonGenerator;
