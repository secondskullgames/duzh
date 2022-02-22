import Coordinates from '../../../geometry/Coordinates';
import { Rect, Room } from '../../../types/types';
import { max, min } from '../../../utils/arrays';
import { checkNotNull } from '../../../utils/preconditions';
import { randInt, sample as randomSample } from '../../../utils/random';
import Connection from './Connection';
import Section from './Section';

interface SectionConnector {
  connectRecursively: (section: Section) => Section;
}

const createSectionConnector = (): SectionConnector => {
  const connectRecursively = (section: Section): Section => {
    // base case (checks here are a bit redundant)
    if (section.firstSubsection === null || section.secondSubsection === null || section.splitDirection === null) {
      return section;
    }

    let connection: Connection;
    switch (section.splitDirection) {
      case 'HORIZONTAL':
        connection = _connectHorizontally(section);
        break;
      case 'VERTICAL':
        connection = _connectVertically(section);
        break;
      default:
        // shouldn't get here due to the check at the top of the method
        throw new Error();
    }

    return new Section({
      rect: section.rect,
      firstSubsection: connectRecursively(section.firstSubsection),
      secondSubsection: connectRecursively(section.secondSubsection),
      splitDirection: section.splitDirection,
      room: null,
      connection
    });
  };

  const _connectHorizontally = (section: Section): Connection => {
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
   * TODO - heavily copy/pasted from {@link #_connectHorizontally}, with all the x/y's flipped.
   */
  const _connectVertically = (section: Section): Connection => {
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

  return { connectRecursively };
};

namespace SectionConnector {
  export const create = createSectionConnector;
}

export default SectionConnector;
