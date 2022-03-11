import Sprite from '../graphics/sprites/Sprite';
import { randChoice } from '../utils/random';
import TileSet from './TileSet';
import TileType from './TileType';

interface Tile {
  type: TileType,
  isBlocking: boolean
  getSprite: () => Sprite | null
}

namespace Tile {
  export const create = (type: TileType, tileSet: TileSet): Tile => {
    const sprite = randChoice(tileSet[type]!!);
    return {
      type,
      getSprite: () => sprite,
      isBlocking: TileType.isBlocking(type)
    };
  };
}

export default Tile;
