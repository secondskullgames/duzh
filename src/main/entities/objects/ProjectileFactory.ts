import MapInstance from '../../maps/MapInstance';
import { Projectile } from '@main/entities';
import { SpriteFactory } from '@main/graphics/sprites';
import { PaletteSwaps } from '@main/graphics';
import { Coordinates, Direction } from '@main/geometry';
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
}
