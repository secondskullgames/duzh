import Projectile from '@main/entities/Projectile';
import MapInstance from '@main/maps/MapInstance';
import { Direction } from '@lib/geometry/Direction';
import { Coordinates } from '@lib/geometry/Coordinates';
import { PaletteSwaps } from '@lib/graphics/PaletteSwaps';
import { Globals } from '@main/core/globals';

export default class ProjectileFactory {
  createArrow = async (
    coordinates: Coordinates,
    map: MapInstance,
    direction: Direction
  ): Promise<Projectile> => {
    const { spriteFactory } = Globals;
    const sprite = await spriteFactory.createProjectileSprite(
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
    const { spriteFactory } = Globals;
    const sprite = await spriteFactory.createProjectileSprite(
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
    const { spriteFactory } = Globals;
    const sprite = await spriteFactory.createStaticSprite('fireball');
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
    const { spriteFactory } = Globals;
    const sprite = await spriteFactory.createStaticSprite('frostbolt');
    return new Projectile({
      name: 'Frostbolt',
      coordinates,
      map,
      direction,
      sprite
    });
  };
}
