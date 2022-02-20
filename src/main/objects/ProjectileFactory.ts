import SpriteFactory from '../graphics/sprites/SpriteFactory';
import Coordinates from '../geometry/Coordinates';
import Direction from '../geometry/Direction';
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
