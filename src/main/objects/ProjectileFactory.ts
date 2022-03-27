import PaletteSwaps from '../graphics/PaletteSwaps';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import Coordinates from '../geometry/Coordinates';
import Direction from '../geometry/Direction';
import { Projectile } from '../types/types';

const createArrow = async ({ x, y }: Coordinates, direction: Direction): Promise<Projectile> => {
  const sprite = await SpriteFactory.createProjectileSprite('arrow', direction, PaletteSwaps.empty());
  return {
    x,
    y,
    direction,
    getSprite: () => sprite,
    update: async () => {}
  };
};

export {
  createArrow
};
