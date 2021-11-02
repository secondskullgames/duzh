import Direction from '../types/Direction';
import { Coordinates, Projectile } from '../types/types';
import SpriteFactory from '../graphics/sprites/SpriteFactory';

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
