import Sprite from '../graphics/sprites/Sprite';
import { randChoice } from '../utils/random';
import TileSet from './TileSet';
import TileType from './TileType';
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
      isBlocking: TileType.isBlocking(type)
    };
  };
}

export default Tile;
