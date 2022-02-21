import Coordinates from '../../geometry/Coordinates';
import TileType from '../../tiles/TileType';
import EmptyMap from './EmptyMap';

class TileEligibilityChecker {
  isBlocked = ({ x, y }: Coordinates, section: EmptyMap, exits: Coordinates[]): boolean => {
    // can't draw a path through an existing room or a wall
    const blockedTileTypes: TileType[] = ['FLOOR', /*'FLOOR_HALL',*/ 'WALL', 'WALL_HALL', 'WALL_TOP'];

    if (exits.some(exit => Coordinates.equals({ x, y }, exit))) {
      return false;
    } else if (section.tiles[y][x] === 'NONE' || section.tiles[y][x] === 'FLOOR_HALL') {
      let dy;
      // skip the check if we're within 1 tile vertically of an exit
      const isNextToExit: boolean = [-2, -1, 1, 2].some(dy => (
        exits.some(exit => Coordinates.equals(exit, { x, y: y + dy }))
      ));

      if (isNextToExit) {
        return false;
      }

      // can't draw tiles within 2 tiles vertically of a wall tile, or a room floor tile
      for (dy of [-2, -1, 1, 2]) {
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
  };
}

export default TileEligibilityChecker;
