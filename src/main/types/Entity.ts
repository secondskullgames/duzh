import Coordinates from '../geometry/Coordinates';
import Sprite from '../graphics/sprites/Sprite';

interface Entity {
  getCoordinates: () => Coordinates;
  getSprite: () => Sprite;
  update: () => Promise<void>;
}

export default Entity;
