import Coordinates from '../geometry/Coordinates';
import SpriteContainer from '../graphics/sprites/SpriteContainer';

interface Entity extends Coordinates, SpriteContainer {
  update: () => Promise<void>;
}

export default Entity;
