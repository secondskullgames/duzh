type TileType =
  'FLOOR'
  | 'FLOOR_HALL'
  | 'WALL_TOP'
  | 'WALL_HALL'
  | 'WALL'
  | 'NONE'
  | 'STAIRS_DOWN';

namespace TileType {
  export const isBlocking = (tileType: TileType) => {
    switch (tileType) {
      case 'FLOOR':
      case 'FLOOR_HALL':
      case 'STAIRS_DOWN':
        return false;
      default:
        return true;
    }
  };
}

export default TileType;
