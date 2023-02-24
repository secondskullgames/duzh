import PaletteSwaps from '../graphics/PaletteSwaps';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import Coordinates from '../geometry/Coordinates';
import Direction from '../geometry/Direction';
import Projectile from '../types/Projectile';

const createArrow = async ({ x, y }: Coordinates, direction: Direction): Promise<Projectile> => {
  const sprite = await SpriteFactory.createProjectileSprite('arrow', direction, PaletteSwaps.empty());
  return new Projectile({
    x,
    y,
    direction,
    sprite
  });
};

const createBolt = async ({ x, y }: Coordinates, direction: Direction): Promise<Projectile> => {
  const sprite = await SpriteFactory.createProjectileSprite('bolt', direction, PaletteSwaps.empty());
  return new Projectile({
    x,
    y,
    direction,
    sprite
  });
};

export default {
  createArrow,
  createBolt
};
