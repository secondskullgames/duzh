import SpriteFactory from '@main/graphics/sprites/SpriteFactory';
import Projectile from '@main/entities/Projectile';
import MapInstance from '@main/maps/MapInstance';
import { Coordinates, Direction } from '@duzh/geometry';
import { PaletteSwaps } from '@lib/graphics/PaletteSwaps';

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
      name: 'Arrow',
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
      name: 'Bolt',
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
      name: 'Fireball',
      coordinates,
      map,
      direction,
      sprite
    });
  };

  createFrostbolt = async (
    coordinates: Coordinates,
    map: MapInstance,
    direction: Direction
  ): Promise<Projectile> => {
    const sprite = await this.spriteFactory.createStaticSprite('frostbolt');
    return new Projectile({
      name: 'Frostbolt',
      coordinates,
      map,
      direction,
      sprite
    });
  };
}
