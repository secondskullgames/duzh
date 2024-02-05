import PaletteSwaps from '../../graphics/PaletteSwaps';
import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import Coordinates from '../../geometry/Coordinates';
import Direction from '../../geometry/Direction';
import Projectile from '../Projectile';
import MapInstance from '../../maps/MapInstance';

type Props = Readonly<{
  spriteFactory: SpriteFactory;
}>;

export default class ProjectileFactory {
  private readonly spriteFactory: SpriteFactory;

  constructor({ spriteFactory }: Props) {
    this.spriteFactory = spriteFactory;
  }

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
