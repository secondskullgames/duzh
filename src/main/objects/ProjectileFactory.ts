import SpriteFactory from '../graphics/sprites/SpriteFactory';
import Coordinates from '../types/Coordinates';
import Direction from '../types/Direction';
import { Projectile } from '../types/types';

const createArrow = async({ x, y }: Coordinates, direction: Direction): Promise<Projectile> => ({
  x,
  y,
  direction,
  sprite: await SpriteFactory.createProjectileSprite('arrow', direction, {}),
  char: 'x'
});

export {
  createArrow
};
