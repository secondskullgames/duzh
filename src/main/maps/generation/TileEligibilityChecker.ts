import { Coordinates, MapSection, TileType } from '../../types/types';
import { coordinatesEquals } from '../MapUtils';

class TileEligibilityChecker {
  isBlocked({ x, y }: Coordinates, section: MapSection, exits: Coordinates[]) {
    // can't draw a path through an existing room or a wall
    const blockedTileTypes = [TileType.FLOOR, /*TileType.FLOOR_HALL,*/ TileType.WALL, TileType.WALL_HALL, TileType.WALL_TOP];

    if (exits.some(exit => coordinatesEquals({ x, y }, exit))) {
      return false;
    } else if (section.tiles[y][x] === TileType.NONE || section.tiles[y][x] === TileType.FLOOR_HALL) {
      // skip the check if we're within 1 tile vertically of an exit
      const isNextToExit: boolean = [-2, -1, 1, 2].some(dy => (
        exits.some(exit => coordinatesEquals(exit, { x, y: y + dy }))
      ));

      if (isNextToExit) {
        return false;
      }

      // can't draw tiles within 2 tiles vertically of a wall tile, or a room floor tile
      for (let dy of [-2, -1, 1, 2]) {
        if ((y + dy >= 0) && (y + dy < section.height)) {
          const tile = section.tiles[y + dy][x];
          if (blockedTileTypes.indexOf(tile) > -1) {
            return true;
          }
        }
      }
      return false;
    } else if (blockedTileTypes.indexOf(section.tiles[y][x]) > -1) {
      return true;
    }
    console.error('how\'d we get here?');
    return true;
  }
}

export default TileEligibilityChecker;