import { TileType } from '../../gen-schema/tile-type.schema';
import Sprite from '../graphics/sprites/Sprite';
import { randChoice } from '../utils/random';
import TileSet from './TileSet';
import { checkNotNull } from '../utils/preconditions';

interface Tile {
  type: TileType,
  isBlocking: boolean
  getSprite: () => Sprite | null
}

namespace Tile {
  export const create = (type: TileType, tileSet: TileSet): Tile => {
    const tilesOfType = checkNotNull(tileSet[type]);
    const sprite = randChoice(tilesOfType);
    return {
      type,
      getSprite: () => sprite,
      isBlocking: _isBlocking(type)
    };
  };
}

const _isBlocking = (tileType: TileType): boolean => {
  switch (tileType) {
    case 'WALL_HALL':
    case 'WALL_TOP':
    case 'NONE':
      return true;
    default:
      return false;
  }
};

export default Tile;
