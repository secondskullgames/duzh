import Coordinates from '../geometry/Coordinates';
import Sprite from '../graphics/sprites/Sprite';

interface Entity extends Coordinates {
  getSprite: () => Sprite;
  update: () => Promise<void>;
}

export default Entity;
