import PaletteSwaps from '../../graphics/PaletteSwaps';
import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import Projectile from '../Projectile';
import MapInstance from '../../maps/MapInstance';
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
