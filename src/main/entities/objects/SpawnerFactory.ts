import Coordinates from '../../geometry/Coordinates';
import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import Spawner from './Spawner';

export type SpawnerClass = 'mirror';

type Props = Readonly<{
  spriteFactory: SpriteFactory
}>;

export default class SpawnerFactory {
  private readonly spriteFactory: SpriteFactory;

  constructor({ spriteFactory }: Props) {
    this.spriteFactory = spriteFactory;
  }

  createMirror = async ({ x, y }: Coordinates): Promise<Spawner> => {
    const sprite = await this.spriteFactory.createMirrorSprite();
    const spawner = new Spawner({
      unitClass: 'shade',
      sprite,
      maxUnits: 10,
      cooldown: 5,
      x,
      y,
      isBlocking: true
    });
    sprite.target = spawner;
    return spawner;
  };

 createSpawner = async ({ x, y }: Coordinates, type: SpawnerClass): Promise<Spawner> => {
    switch (type) {
      case 'mirror':
        return this.createMirror({ x, y });
      default:
        throw new Error(`Unknown spawner type: ${type}`);
    }
  };
}
