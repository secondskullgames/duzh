import Sprite from '../classes/Sprite';

interface Tile {
  name: string,
  char: string,
  sprite: Sprite,
  isBlocking: boolean
}

export default Tile;