import Sprite from '../classes/Sprite';
import { Coordinates } from '../types';

interface Entity extends Coordinates {
  char: string,
  sprite: Sprite
}

export default Entity;