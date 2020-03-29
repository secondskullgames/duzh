import DungeonGenerator from './DungeonGenerator';
import { Coordinates, MapSection, Room, TileSet, TileType } from '../../types/types';
import { randChoice, randInt, shuffle } from '../../utils/RandomUtils';
import { comparing } from '../../utils/ArrayUtils';
import { coordinatesEquals, hypotenuse, isAdjacent, isBlocking } from '../MapUtils';
import Pathfinder from '../../utils/Pathfinder';

/**
 * Based on http://www.roguebasin.com/index.php?title=Basic_BSP_Dungeon_generation
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
      this._joinSection(section);

      return {
        width,
        height,
        rooms: section.rooms.map(room => ({
          left: room.left,
          top: room.top + 1,
          width: room.width,
          height: room.height,
          exits: room.exits.map(({ x, y }) => ({ x, y: y + 1 }))
        })),
        tiles: [this._emptyRow(width), ...section.tiles]
      };
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
    // First, make sure the area is large enough to support two sections; if not, we're done
    const minSectionDimension = this._minRoomDimension + (2 * this._minRoomPadding);
    const canSplitHorizontally = (width >= (2 * minSectionDimension));
    const canSplitVertically = (height >= (2 * minSectionDimension));

    const splitDirections = [
      ...(canSplitHorizontally ? ['HORIZONTAL'] : []),
      ...(canSplitVertically ? ['VERTICAL'] : []),
      ...((!canSplitHorizontally && !canSplitVertically) ? ['NEITHER'] : [])
    ];

    if (splitDirections.length > 0) {
      const direction = randChoice(splitDirections);
      if (direction === 'HORIZONTAL') {
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
      } else if (direction === 'VERTICAL') {
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
      }
    }

    // Base case: return a single section
    return this._generateSingleSection(width, height);
  }

  /**
   * Create a rectangular section of tiles, consisting of a room surrounded by empty spaces.  The room can be placed
   * anywhere in the region at random, and can occupy a variable amount of space in the region
   * (within the specified parameters).
   */
  private _generateSingleSection(width: number, height: number): MapSection {
    const maxRoomWidth = width - (2 * this._minRoomPadding);
    const maxRoomHeight = height - (2 * this._minRoomPadding);
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
          tiles[y][x] = TileType.NONE;
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
          tiles[y][x] = TileType.WALL_TOP;
        } else if (x === 0 || x === (width - 1) || y === 0 || y === (height - 1)) {
          tiles[y][x] = TileType.WALL;
        } else {
          tiles[y][x] = TileType.FLOOR;
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

  private _joinSection(section: MapSection) {
    const unconnectedRooms: Room[] = [...section.rooms];
    const connectedRooms: Room[] = [];
    const nextRoom = unconnectedRooms.pop();
    if (!!nextRoom) {
      connectedRooms.push(nextRoom);
    }

    while (unconnectedRooms.length > 0) {
      const candidatePairs: [Room, Room][] = connectedRooms
        .flatMap(connectedRoom => unconnectedRooms.map(unconnectedRoom => <[Room, Room]>[connectedRoom, unconnectedRoom]))
        .filter(([connectedRoom, unconnectedRoom]) => this._canJoinRooms(connectedRoom, unconnectedRoom))
        .sort(comparing(([first, second]) => this._roomDistance(first, second)));

      let joinedAnyRooms = false;
      for (let [connectedRoom, unconnectedRoom] of candidatePairs) {
        if (this._joinRooms(connectedRoom, unconnectedRoom, section)) {
          unconnectedRooms.splice(unconnectedRooms.indexOf(unconnectedRoom), 1);
          connectedRooms.push(unconnectedRoom);
          joinedAnyRooms = true;
          break;
        }
      }

      if (!joinedAnyRooms) {
        console.error('Couldn\'t connect rooms!');
        this._logSections('fux', section);
        debugger;
      }
    }
  }

  /**
   * add walls above corridor tiles if possible
   */
  private _addWalls(section: MapSection) {
    for (let y = 0; y < section.height; y++) {
      for (let x = 0; x < section.width; x++) {
        if (y > 0) {
          if (section.tiles[y][x] === TileType.FLOOR_HALL) {
            if (section.tiles[y - 1][x] === TileType.NONE || section.tiles[y - 1][x] === TileType.WALL) {
              section.tiles[y - 1][x] = TileType.WALL_HALL;
            }
          }
        }
      }
    }
  }

  private _roomDistance(first: Room, second: Room) {
    const firstCenter = { x: first.left + first.width / 2, y: first.top + first.height / 2 };
    const secondCenter = { x: second.left + second.width / 2, y: second.top + second.height / 2 };
    return hypotenuse(firstCenter, secondCenter);
  }

  private _canJoinRooms(first: Room, second: Room) {
    return (first !== second); // && (first.exits.length < MAX_EXITS) && (second.exits.length < MAX_EXITS);
  }

  private _joinRooms(first: Room, second: Room, section: MapSection): boolean {
    const firstExitCandidates = this._getExitCandidates(first);
    const secondExitCandidates = this._getExitCandidates(second);
    shuffle(firstExitCandidates);
    shuffle(secondExitCandidates);

    for (let firstExit of firstExitCandidates) {
      for (let secondExit of secondExitCandidates) {
        if (this._joinExits(firstExit, secondExit, section)) {
          first.exits.push(firstExit);
          second.exits.push(secondExit);
          return true;
        }
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
    const blockedTileDetector = ({ x, y }: Coordinates) => {
      // can't draw a path through an existing room or a wall
      const blockedTileType = [TileType.FLOOR, TileType.WALL, TileType.WALL_HALL, TileType.WALL_TOP];

      if ([firstExit, secondExit].some(exit => coordinatesEquals({ x, y }, exit))) {
        return false;
      } else if (section.tiles[y][x] === TileType.NONE || section.tiles[y][x] === TileType.FLOOR_HALL) {
        // skip the check if we're within 1 tile vertically of an exit
        const isNextToExit: boolean = [-2, -1, 1, 2].some(dy => (
          [firstExit, secondExit].some(exit => coordinatesEquals(exit, { x, y: y + dy }))
        ));

        if (isNextToExit) {
          return false;
        }

        // can't draw tiles within 2 tiles vertically of a wall tile, or a room floor tile
        for (let dy of [-2, -1, 1, 2]) {
          if ((y + dy >= 0) && (y + dy < section.height)) {
            const tile = section.tiles[y + dy][x];
            if (blockedTileType.indexOf(tile) > -1) {
              return true;
            }
          }
        }
        return false;
      } else if (blockedTileType.indexOf(section.tiles[y][x]) > -1) {
        return true;
      }
      console.error('how\'d we get here?');
      return true;
    };

    // prefer reusing floor hall tiles
    const tileCostCalculator = (first: Coordinates, second: Coordinates) => {
      return (section.tiles[second.y][second.x] === TileType.FLOOR_HALL) ? 0.01 : 1;
    };

    const mapRect = {
      left: 0,
      top: 0,
      width: section.width,
      height: section.height
    };
    const path = new Pathfinder(blockedTileDetector, tileCostCalculator).findPath(firstExit, secondExit, mapRect);
    path.forEach(({ x, y }) => {
      section.tiles[y][x] = TileType.FLOOR_HALL;
    });

    return (path.length > 0);
  }

  private _emptyRow(width: number): TileType[] {
    const row: TileType[] = [];
    for (let x = 0; x < width; x++) {
      row.push(TileType.NONE);
    }
    return row;
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
}

export default RoomCorridorDungeonGenerator;