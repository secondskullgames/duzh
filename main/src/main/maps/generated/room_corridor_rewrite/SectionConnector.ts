import Connection from './Connection';
import Section from './Section';
import { Coordinates } from '@lib/geometry/Coordinates';
import { Rect } from '@lib/geometry/Rect';
import { max, min } from '@duzh/utils/arrays';
import { checkNotNull } from '@duzh/utils/preconditions';
import { randInt } from '@duzh/utils/random';

type Room = Rect & {
  exits: Coordinates[];
};

interface SectionConnector {
  connectRecursively: (section: Section) => Section;
}

const createSectionConnector = (): SectionConnector => {
  const connectRecursively = (section: Section): Section => {
    // base case (checks here are a bit redundant)
    if (
      section.firstSubsection === null ||
      section.secondSubsection === null ||
      section.splitDirection === null
    ) {
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

    // console.debug('left=', matchingLeftRooms);
    // console.debug('right=', matchingRightRooms);

    const possibleConnections: [Rect, Rect][] = [];
    for (const leftRoom of matchingLeftRooms) {
      for (const rightRoom of matchingRightRooms) {
        possibleConnections.push([leftRoom, rightRoom]);
      }
    }

    const distances: Map<[Rect, Rect], number> = new Map();
    let minDistance: number | null = null;
    for (const connection of possibleConnections) {
      const [leftRoom, rightRoom] = connection;
      const leftRoomCenterY = leftRoom.top + leftRoom.height / 2;
      const rightRoomCenterY = rightRoom.top + rightRoom.height / 2;
      const distance = Math.abs(leftRoomCenterY - rightRoomCenterY);
      distances.set(connection, distance);
      minDistance = minDistance === null ? distance : Math.min(distance, minDistance);
    }

    const connections = possibleConnections.filter(connection => {
      const connectionDistance = checkNotNull(distances.get(connection));
      minDistance = checkNotNull(minDistance);
      return connectionDistance <= minDistance * 100;
    });
    const roomToExit = new Map<Rect, Coordinates>();

    for (const [leftRoom, rightRoom] of connections) {
      const leftExitY = randInt(leftRoom.top + 1, leftRoom.top + leftRoom.height - 2);
      roomToExit.set(leftRoom, { x: leftRoom.left + leftRoom.width - 1, y: leftExitY });

      const bottomExitY = randInt(
        rightRoom.top + 1,
        rightRoom.top + rightRoom.height - 2
      );
      roomToExit.set(rightRoom, { x: rightRoom.left, y: bottomExitY });
    }

    const allRoomsToConnect = connections.flatMap(([left, right]) => [left, right]);
    const minY = min(
      allRoomsToConnect.map(room => checkNotNull(roomToExit.get(room)?.y))
    );
    const maxY = max(
      allRoomsToConnect.map(room => checkNotNull(roomToExit.get(room)?.y))
    );
    const midY = randInt(minY, maxY);

    const connectedCoordinates: Coordinates[] = [];

    for (const [leftRoom, rightRoom] of connections) {
      {
        const exit = checkNotNull(roomToExit.get(leftRoom));
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
      {
        const exit = checkNotNull(roomToExit.get(rightRoom));
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

    // console.debug('top=', matchingTopRooms);
    // console.debug('bottom=', matchingBottomRooms);

    const possibleConnections: [Rect, Rect][] = [];
    for (const topRoom of matchingTopRooms) {
      for (const bottomRoom of matchingBottomRooms) {
        possibleConnections.push([topRoom, bottomRoom]);
      }
    }

    const distances: Map<[Rect, Rect], number> = new Map();
    let minDistance: number | null = null;
    for (const connection of possibleConnections) {
      const [topRoom, bottomRoom] = connection;
      const topRoomCenterX = topRoom.left + topRoom.width / 2;
      const bottomRoomCenterX = bottomRoom.left + bottomRoom.width / 2;
      const distance = Math.abs(topRoomCenterX - bottomRoomCenterX);
      distances.set(connection, distance);
      minDistance = minDistance === null ? distance : Math.min(distance, minDistance);
    }

    const connections = possibleConnections.filter(connection => {
      const connectionDistance = checkNotNull(distances.get(connection));
      minDistance = checkNotNull(minDistance);
      return connectionDistance <= minDistance * 1.5;
    });
    const roomToExit = new Map<Rect, Coordinates>();

    for (const [topRoom, bottomRoom] of connections) {
      const topExitX = randInt(topRoom.left + 1, topRoom.left + topRoom.width - 2);
      roomToExit.set(topRoom, { x: topExitX, y: topRoom.top + topRoom.height - 1 });

      const bottomExitX = randInt(
        bottomRoom.left + 1,
        bottomRoom.left + bottomRoom.width - 2
      );
      roomToExit.set(bottomRoom, { x: bottomExitX, y: bottomRoom.top });
    }

    const allRoomsToConnect = connections.flatMap(([top, bottom]) => [top, bottom]);

    const minX = min(
      allRoomsToConnect.map(room => checkNotNull(roomToExit.get(room)?.x))
    );
    const maxX = max(
      allRoomsToConnect.map(room => checkNotNull(roomToExit.get(room)?.x))
    );
    const midX = randInt(minX, maxX);

    const connectedCoordinates: Coordinates[] = [];

    for (const [topRoom, bottomRoom] of connections) {
      {
        const exit = checkNotNull(roomToExit.get(topRoom));
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
      {
        const exit = checkNotNull(roomToExit.get(bottomRoom));
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
