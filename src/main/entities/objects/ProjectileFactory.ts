import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import Projectile from '../Projectile';
import MapInstance from '../../maps/MapInstance';
import Direction from '@lib/geometry/Direction';
import Coordinates from '@lib/geometry/Coordinates';
import { PaletteSwaps } from '@lib/graphics/PaletteSwaps';
import { injectable } from 'inversify';

@injectable()
export default class ProjectileFactory {
  constructor(private readonly spriteFactory: SpriteFactory) {}

  createArrow = async (
    coordinates: Coordinates,
    map: MapInstance,
    direction: Direction
  ): Promise<Projectile> => {
    const sprite = await this.spriteFactory.createProjectileSprite(
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

  createBolt = async (
    coordinates: Coordinates,
    map: MapInstance,
    direction: Direction
  ): Promise<Projectile> => {
    const sprite = await this.spriteFactory.createProjectileSprite(
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

  createFireball = async (
    coordinates: Coordinates,
    map: MapInstance,
    direction: Direction
  ): Promise<Projectile> => {
    const sprite = await this.spriteFactory.createStaticSprite('fireball');
    return new Projectile({
      coordinates,
      map,
      direction,
      sprite
    });
  };
}
