import Coordinates from '../geometry/Coordinates';
import Sprite from '../graphics/sprites/Sprite';

interface Entity {
  getCoordinates: () => Coordinates;
  getSprite: () => Sprite | null;
  update: () => Promise<void>;
  isBlocking: () => boolean;
}

export default Entity;
