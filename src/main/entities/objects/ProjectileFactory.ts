import PaletteSwaps from '../../graphics/PaletteSwaps';
import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import Coordinates from '../../geometry/Coordinates';
import Direction from '../../geometry/Direction';
import Projectile from '../Projectile';
import MapInstance from '../../maps/MapInstance';

const createArrow = async (
  coordinates: Coordinates,
  map: MapInstance,
  direction: Direction,
  spriteFactory: SpriteFactory
): Promise<Projectile> => {
  const sprite = await spriteFactory.createProjectileSprite(
    'arrow',
    direction,
    PaletteSwaps.empty()
  );
  return new Projectile({
    coordinates,
    map,
    direction,
    sprite
  });
};

const createBolt = async (
  coordinates: Coordinates,
  map: MapInstance,
  direction: Direction,
  spriteFactory: SpriteFactory
): Promise<Projectile> => {
  const sprite = await spriteFactory.createProjectileSprite(
    'bolt',
    direction,
    PaletteSwaps.empty()
  );
  return new Projectile({
    coordinates,
    map,
    direction,
    sprite
  });
};

export default {
  createArrow,
  createBolt
};
