import Coordinates from '../../../geometry/Coordinates';
import TileSet from '../../../tiles/TileSet';
import TileType from '../../../tiles/TileType';
import { Rect, Room } from '../../../types/types';
import { max, min } from '../../../utils/arrays';
import AbstractMapGenerator from '../AbstractMapGenerator';
import EmptyMap from '../EmptyMap';
import Section from './Section';
import { randChoice, randInt, sample as randomSample } from '../../../utils/random';
import SplitDirection from './SplitDirection';
import Connection from './Connection';
import { checkNotNull } from '../../../utils/preconditions';

const MIN_ROOM_WIDTH = 4;
const MIN_ROOM_HEIGHT = 4;
const HORIZONTAL_SECTION_PADDING = 2;
const VERTICAL_SECTION_PADDING = 2;
const MIN_SECTION_WIDTH = MIN_ROOM_WIDTH + HORIZONTAL_SECTION_PADDING * 2 + 1;
const MIN_SECTION_HEIGHT = MIN_ROOM_HEIGHT + VERTICAL_SECTION_PADDING * 2 + 1;

/**
 * This class generates randomized room-and-corridor levels similar to those used in Rogue and other classic
 * roguelikes.
 *
 * The general strategy is:
 *
 * recursively split the map into sections
 * add rooms to sections that can't be split up further
 * add connections between each pair of sections, between any rooms that are close enough
 *
 * Note that this was ported from a previous Java implementation and may not be idiomatic Typescript.
 */
class RoomCorridorLevelGenerator2 extends AbstractMapGenerator {
  // The following ASCII diagram looks horrible but is necessary to explain how section sizing works.
  // Section dimensions are calculated as the sum of room dimensions, two sets of padding, and an extra
  // row/column for section boundaries.
  //
  //    +--------+
  //    |        |
  //    |        |
  //    |  ####  |
  //    |  ####  |
  //    |  ####  |
  //    |  ####  |
  //    |        |
  //    |        |
  //    +--------+

  constructor(tileSet: TileSet) {
    super(tileSet);
  }

  /**
   * @override
   */
  generateTiles = (width: number, height: number): EmptyMap => {
    const rect: Rect = { left: 0, top: 0, width, height };
    let section: Section = new Section({ rect });
    section = this._splitRecursively(section);
    section = this._connectRecursively(section);
    const tiles: TileType[][] = this._getFloorTiles(section);
    this._addWalls(tiles);

    return {
      width,
      height,
      rooms:  [], // TODO
      tiles
    };
  };

  private _splitRecursively = (section: Section): Section => {
    const canSplitHorizontally = section.getWidth() >= MIN_SECTION_WIDTH * 2;
    const canSplitVertically = section.getHeight() >= MIN_SECTION_HEIGHT * 2;

    const splitDirection = this._pickSplitDirection(canSplitHorizontally, canSplitVertically);

    switch (splitDirection) {
      case 'HORIZONTAL':
        return this._splitHorizontally(section);
      case 'VERTICAL':
        return this._splitVertically(section);
      case 'NONE':
        return this._addRoom(section);
    }
  };

  private _pickSplitDirection = (canSplitHorizontally: boolean, canSplitVertically: boolean): SplitDirection => {
    if (canSplitHorizontally && canSplitVertically) {
      return randChoice(['HORIZONTAL', 'VERTICAL']);
    } else if (canSplitHorizontally) {
      return 'HORIZONTAL';
    } else if (canSplitVertically) {
      return 'VERTICAL';
    } else {
      return 'NONE';
    }
  };

  private _splitHorizontally = (section: Section): Section => {
    const leftWidth = randInt(MIN_SECTION_WIDTH, section.getWidth() - MIN_SECTION_WIDTH);
    const left = new Section({
      rect: { ...section.rect, width: leftWidth }
    });

    const right = new Section({
      rect: { ...section.rect, left: section.rect.left + leftWidth, width: section.rect.width - leftWidth }
    });

    return section.withSubsections(
      this._splitRecursively(left),
      this._splitRecursively(right),
      'HORIZONTAL'
    );
  };

  private _splitVertically = (section: Section): Section => {
    const topHeight = randInt(MIN_SECTION_HEIGHT, section.rect.height - MIN_SECTION_HEIGHT);
    const top = new Section({
      rect: { ...section.rect, height: topHeight }
    });

    const bottom = new Section({
      rect: { ...section.rect, top: section.rect.top + topHeight, height: section.rect.height - topHeight }
    });

    return section.withSubsections(
      this._splitRecursively(top),
      this._splitRecursively(bottom),
      'VERTICAL'
    );
  };

  private _addRoom = (section: Section): Section => {
    const sectionRight = section.getLeft() + section.getWidth();
    const sectionBottom = section.getTop() + section.getHeight();

    const minLeft = section.getLeft() + HORIZONTAL_SECTION_PADDING + 1;
    const maxLeft = sectionRight - HORIZONTAL_SECTION_PADDING - MIN_ROOM_WIDTH;
    const minTop = section.getTop() + VERTICAL_SECTION_PADDING + 1;
    const maxTop = sectionBottom - VERTICAL_SECTION_PADDING - MIN_ROOM_HEIGHT;

    const left = randInt(minLeft, maxLeft);
    const top = randInt(minTop, maxTop);
    const width = randInt(MIN_ROOM_WIDTH, sectionRight - VERTICAL_SECTION_PADDING - left);
    const height = randInt(MIN_ROOM_HEIGHT, sectionBottom - VERTICAL_SECTION_PADDING - top);

    return section.withRoom({ left, top, width, height });
  };

  private _connectRecursively = (section: Section): Section => {
    // base case (checks here are a bit redundant)
    if (section.firstSubsection === null || section.secondSubsection === null || section.splitDirection === null) {
      return section;
    }

    let connection: Connection;
    switch (section.splitDirection) {
      case 'HORIZONTAL':
        connection = this._connectHorizontally(section);
        break;
      case 'VERTICAL':
        connection = this._connectVertically(section);
        break;
      default:
        // shouldn't get here due to the check at the top of the method
        throw new Error();
    }

    return new Section({
      rect: section.rect,
      firstSubsection: this._connectRecursively(section.firstSubsection),
      secondSubsection: this._connectRecursively(section.secondSubsection),
      splitDirection: section.splitDirection,
      room: null,
      connection
    });
  };

  private _connectHorizontally = (section: Section): Connection => {
    const left = checkNotNull(section.firstSubsection);
    const right = checkNotNull(section.secondSubsection);

    const splitPoint = right.getLeft();
    const allLeftSections: Section[] = left.getAllSubsections();
    allLeftSections.push(left);

    const allRightSections: Section[] = right.getAllSubsections();
    allRightSections.push(right);

    const matchingLeftRooms: Rect[] = [...allLeftSections]
      .filter(s => s.getLeft() + s.getWidth() === splitPoint)
      .map(s => s.room)
      .filter(room => room !== null)
      .map(room => room as Room);

    const matchingRightRooms: Rect[] = [...allRightSections]
      .filter(s => s.getLeft() === splitPoint)
      .map(s => s.room)
      .filter(room => room !== null)
      .map(room => room as Room);

    const leftRoomsToConnect: Rect[] = randomSample(matchingLeftRooms);
    const rightRoomsToConnect: Rect[] = randomSample(matchingRightRooms);
    const allRoomsToConnect: Rect[] = [...leftRoomsToConnect, ...rightRoomsToConnect];
    const roomToExit = new Map<Rect, Coordinates>();

    for (const room of leftRoomsToConnect) {
      const exitY = randInt(room.top + 1, room.top + room.height - 2);
      roomToExit.set(room, { x: room.left + room.width - 1, y: exitY });
    }

    for (const room of rightRoomsToConnect) {
      const exitY = randInt(room.top + 1, room.top + room.height - 2);
      roomToExit.set(room, { x: room.left, y: exitY });
    }

    const minY = min(allRoomsToConnect.map(room => checkNotNull(roomToExit.get(room)?.y)));
    const maxY = max(allRoomsToConnect.map(room => checkNotNull(roomToExit.get(room)?.y)));
    const midY = randInt(minY, maxY);

    const connectedCoordinates: Coordinates[] = [];

    for (const room of leftRoomsToConnect) {
      const exit = checkNotNull(roomToExit.get(room));
      let { x, y } = { x: exit.x + 1, y: exit.y };
      while (x < splitPoint) {
        connectedCoordinates.push({ x, y });
        x++;
      }

      const dy = Math.sign(midY - y);
      while (y !== midY) {
        connectedCoordinates.push({ x, y });
        y += dy;
      }
      connectedCoordinates.push({ x, y });
    }

    for (const room of rightRoomsToConnect) {
      const exit = checkNotNull(roomToExit.get(room));
      let { x, y } = { x: exit.x - 1, y: exit.y };
      while (x > splitPoint) {
        connectedCoordinates.push({ x, y });
        x--;
      }

      const dy = Math.sign(midY - y);
      while (y !== midY) {
        connectedCoordinates.push({ x, y });
        y += dy;
      }
      connectedCoordinates.push({ x, y });
    }

    return {
      connectedCoordinates
    };
  };

  /**
   * TODO - heavily copy/pasted from {@link #_connectVertically}, with all the x/y's flipped.
   */
  private _connectVertically = (section: Section): Connection => {
    const top = checkNotNull(section.firstSubsection);
    const bottom = checkNotNull(section.secondSubsection);

    const splitPoint = bottom.getTop();
    const allTopSections: Section[] = top.getAllSubsections();
    allTopSections.push(top);

    const allBottomSections: Section[] = bottom.getAllSubsections();
    allBottomSections.push(bottom);

    const matchingTopRooms: Rect[] = [...allTopSections]
      .filter(s => s.getTop() + s.getHeight() === splitPoint)
      .map(s => s.room)
      .filter(room => room !== null)
      .map(room => room as Room);

    const matchingBottomRooms: Rect[] = [...allBottomSections]
      .filter(s => s.getTop() === splitPoint)
      .map(s => s.room)
      .filter(room => room !== null)
      .map(room => room as Room);

    const topRoomsToConnect: Rect[] = randomSample(matchingTopRooms);
    const bottomRoomsToConnect: Rect[] = randomSample(matchingBottomRooms);
    const allRoomsToConnect: Rect[] = [...topRoomsToConnect, ...bottomRoomsToConnect];
    const roomToExit = new Map<Rect, Coordinates>();

    for (const room of topRoomsToConnect) {
      const exitX = randInt(room.left + 1, room.left + room.width - 2); // TODO this was right()
      roomToExit.set(room, { x: exitX, y: room.top + room.height - 1 }); // TODO this was bottom()
    }

    for (const room of bottomRoomsToConnect) {
      const exitX = randInt(room.left + 1, room.left + room.width - 2); // TODO this was right()
      roomToExit.set(room, { x: exitX, y: room.top });
    }

    const minX = min(allRoomsToConnect.map(room => checkNotNull(roomToExit.get(room)?.x)));
    const maxX = max(allRoomsToConnect.map(room => checkNotNull(roomToExit.get(room)?.x)));
    const midX = randInt(minX, maxX);

    const connectedCoordinates: Coordinates[] = [];

    for (const room of topRoomsToConnect) {
      const exit = checkNotNull(roomToExit.get(room));
      let { x, y } = { x: exit.x, y: exit.y + 1 };
      while (y < splitPoint) {
        connectedCoordinates.push({ x, y });
        y++;
      }

      const dx = Math.sign(midX - x);
      while (x !== midX) {
        connectedCoordinates.push({ x, y });
        x += dx;
      }
      connectedCoordinates.push({ x, y });
    }

    for (const room of bottomRoomsToConnect) {
      const exit = checkNotNull(roomToExit.get(room));
      let { x, y } = { x: exit.x, y: exit.y - 1 };
      while (y > splitPoint) {
        connectedCoordinates.push({ x, y });
        y--;
      }

      const dx = Math.sign(midX - x);
      while (x !== midX) {
        connectedCoordinates.push({ x, y });
        x += dx;
      }
      connectedCoordinates.push({ x, y });
    }

    return {
      connectedCoordinates
    };
  };

  private _getFloorTiles = (section: Section): TileType[][] => {
    const tiles: TileType[][] = [];
    for (let y = 0; y < section.getHeight(); y++) {
      const row: TileType[] = [];
      tiles.push(row);
      for (let x = 0; x < section.getWidth(); x++) {
        row.push('NONE');
      }
    }

    const allSections = section.getAllSubsections();
    allSections.push(section);
    for (const s of allSections) {
      if (s.room !== null) {
        const { left, top, width, height } = s.room;
        for (let y = top; y < top + height; y++) {
          for (let x = left; x < left + width; x++) {
            tiles[y][x] = 'FLOOR';
          }
        }
      }

      if (s.connection !== null) {
        for (const { x, y } of s.connection.connectedCoordinates) {
          tiles[y][x] = 'FLOOR_HALL';
        }
      }
    }
    return tiles;
  };

  private _addWalls = (tiles: TileType[][]) => {
    const height = tiles.length;
    const width = tiles[0].length;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tileType = tiles[y][x];
        switch (tileType) {
          case 'FLOOR':
          case 'FLOOR_HALL':
            if (y >= 1) {
              if (tiles[y - 1][x] === 'NONE') {
                tiles[y - 1][x] = (tileType === 'FLOOR_HALL') ? 'WALL_HALL' : 'WALL';
              }
              if (y >= 2) {
                if (tiles[y - 2][x] === 'NONE') {
                  tiles[y - 2][x] = 'WALL_TOP';
                }
              }
            }
        }
      }
    }
  };
}

export default RoomCorridorLevelGenerator2;
