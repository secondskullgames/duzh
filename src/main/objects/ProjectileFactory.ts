import PaletteSwaps from '../graphics/PaletteSwaps';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import Coordinates from '../geometry/Coordinates';
import Direction from '../geometry/Direction';
import Projectile from '../types/Projectile';
import { checkNotNull } from '../utils/preconditions';

type Props = Readonly<{
  spriteFactory: SpriteFactory
}>;

export default class ProjectileFactory {
  private readonly spriteFactory: SpriteFactory;

  constructor({ spriteFactory }: Props) {
    this.spriteFactory = spriteFactory;
  }

  createArrow = async ({ x, y }: Coordinates, direction: Direction): Promise<Projectile> => {
    const sprite = await this.spriteFactory.createProjectileSprite('arrow', direction, PaletteSwaps.empty());
    return new Projectile({
      x,
      y,
      direction,
      sprite
    });
  };

  createBolt = async ({ x, y }: Coordinates, direction: Direction): Promise<Projectile> => {
    const sprite = await this.spriteFactory.createProjectileSprite('bolt', direction, PaletteSwaps.empty());
    return new Projectile({
      x,
      y,
      direction,
      sprite
    });
  };

  private static instance: ProjectileFactory | null = null;
  static getInstance = (): ProjectileFactory => checkNotNull(ProjectileFactory.instance);
  static setInstance = (factory: ProjectileFactory) => { this.instance = factory; };
}
