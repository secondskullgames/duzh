import EmptyRegionConnection from './EmptyRegionConnection';
import { Connection } from './Connection';
import RoomRegion from './RoomRegion';
import { Coordinates } from '@lib/geometry/Coordinates';
import { randChoice, randInt, shuffle } from '@lib/utils/random';
import { areAdjacent } from '@lib/geometry/RectUtils';

const MIN_BORDER_LENGTH = 5;

const _canConnect = (first: RoomRegion, second: RoomRegion): boolean =>
  areAdjacent(first.rect, second.rect, MIN_BORDER_LENGTH);

const _buildConnection = (first: RoomRegion, second: RoomRegion): Connection => {
  let connectionPoint: Coordinates; // on the starting edge of `second`
  let firstCoordinates: Coordinates;
  let secondCoordinates: Coordinates;
  // right-left
  if (first.rect.left + first.rect.width === second.rect.left) {
    const top = Math.max(first.rect.top, second.rect.top);
    const bottom = Math.min(
      first.rect.top + first.rect.height,
      second.rect.top + second.rect.height
    ); // exclusive
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
    const right = Math.min(
      first.rect.left + first.rect.width,
      second.rect.left + second.rect.width
    ); // exclusive
    connectionPoint = {
      x: randInt(left + 2, right - 2), // should be in range since we checked _canConnect already
      y: second.rect.top
    };
    firstCoordinates = { x: connectionPoint.x, y: connectionPoint.y - 1 };
    secondCoordinates = { x: connectionPoint.x, y: connectionPoint.y + 1 };
  }
  // left-right
  else if (first.rect.left === second.rect.left + second.rect.width) {
    const top = Math.max(first.rect.top, second.rect.top);
    const bottom = Math.min(
      first.rect.top + first.rect.height,
      second.rect.top + second.rect.height
    ); // exclusive
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
    const right = Math.min(
      first.rect.left + first.rect.width,
      second.rect.left + second.rect.width
    ); // exclusive
    connectionPoint = {
      x: randInt(left + 2, right - 2), // should be in range since we checked _canConnect already
      y: first.rect.top
    };
    firstCoordinates = { x: connectionPoint.x, y: connectionPoint.y + 1 };
    secondCoordinates = { x: connectionPoint.x, y: connectionPoint.y - 1 };
  } else {
    throw new Error('Failed to build connection');
  }

  const direction =
    firstCoordinates.x === secondCoordinates.x ? 'VERTICAL' : 'HORIZONTAL';
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

const generateMinimalSpanningTree = (regions: RoomRegion[]): Connection[] => {
  const connectedRegions = [randChoice(regions)];
  const unconnectedRegions = regions.filter(region => !connectedRegions.includes(region));
  shuffle(unconnectedRegions);

  const connections: Connection[] = [];
  while (unconnectedRegions.length > 0) {
    shuffle(connectedRegions);
    let connectedAny = false;
    for (const connectedRegion of connectedRegions) {
      for (let j = 0; j < unconnectedRegions.length; j++) {
        const unconnectedRegion = unconnectedRegions[j];
        if (_canConnect(connectedRegion, unconnectedRegion)) {
          unconnectedRegions.splice(j, 1);
          connectedRegions.push(unconnectedRegion);
          connections.push(_buildConnection(connectedRegion, unconnectedRegion));
          connectedAny = true;
          break;
        }
      }
    }

    if (!connectedAny) {
      /* eslint-disable no-console */
      console.log('connected:');
      connectedRegions.forEach(x => console.log(x));
      console.log('unconnected:');
      unconnectedRegions.forEach(x => console.log(x));
      /* eslint-enable no-console */
      throw new Error('Failed to generate minimal spanning tree');
    }
  }

  return connections;
};

const generateOptionalConnections = (
  regions: RoomRegion[],
  spanningConnections: Connection[]
): Connection[] => {
  const optionalConnections: Connection[] = [];
  for (let i = 0; i < regions.length; i++) {
    const first = regions[i];
    for (let j = i + 1; j < regions.length; j++) {
      const second = regions[j];
      if (_canConnect(first, second)) {
        if (
          !spanningConnections.some(connection =>
            Connection.matches(connection, first, second)
          )
        ) {
          optionalConnections.push(_buildConnection(first, second));
        }
      }
    }
  }

  return optionalConnections;
};

const generateEmptyRegionConnections = (
  roomRegions: RoomRegion[],
  spanningConnections: Connection[],
  optionalConnections: Connection[]
): EmptyRegionConnection[] => {
  const connections: EmptyRegionConnection[] = [];
  for (const roomRegion of roomRegions) {
    if (!roomRegion.roomRect) {
      const connectedRegions: RoomRegion[] = [];
      const neighbors = roomRegions
        .filter(s => s !== roomRegion)
        .filter(s => _canConnect(roomRegion, s));
      for (const neighbor of neighbors) {
        if (
          spanningConnections.some(connection =>
            Connection.matches(connection, roomRegion, neighbor)
          )
        ) {
          connectedRegions.push(neighbor);
        }
      }
      if (connectedRegions.length === 1) {
        shuffle(neighbors);
        for (const neighbor of neighbors) {
          if (
            optionalConnections.some(connection =>
              Connection.matches(connection, roomRegion, neighbor)
            )
          ) {
            connectedRegions.push(neighbor);
            break;
          }
        }
      }
      if (connectedRegions.length > 0) {
        connections.push({ roomRegion, neighbors: connectedRegions });
      }
    }
  }

  return connections;
};

export default {
  generateMinimalSpanningTree,
  generateOptionalConnections,
  generateEmptyRegionConnections
};
