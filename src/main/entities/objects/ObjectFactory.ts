import Coordinates from '../../geometry/Coordinates';
import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import Spawner from './Spawner';
import UnitFactory from '../units/UnitFactory';
import HumanDeterministicController from '../units/controllers/HumanDeterministicController';
import GameState from '../../core/GameState';
import GameObject from './GameObject';
import Block from './Block';

export type SpawnerClass = 'mirror';

type Props = Readonly<{
  spriteFactory: SpriteFactory,
  unitFactory: UnitFactory,
  state: GameState
}>;

export default class ObjectFactory {
  private readonly spriteFactory: SpriteFactory;
  private readonly unitFactory: UnitFactory;
  private readonly state: GameState;

  constructor({ spriteFactory, unitFactory, state }: Props) {
    this.spriteFactory = spriteFactory;
    this.unitFactory = unitFactory;
    this.state = state;
  }

  createMirror = async ({ x, y }: Coordinates): Promise<Spawner> => {
    const { state, spriteFactory, unitFactory } = this;
    const sprite = await spriteFactory.createMirrorSprite();
    const spawnFunction = ({ x, y }: Coordinates) => unitFactory.createUnit({
      unitClass: 'shade',
      coordinates: { x, y },
      level: 1,
      controller: new HumanDeterministicController({ state }),
      faction: 'ENEMY'
    });
    const spawner = new Spawner({
      spawnFunction,
      sprite,
      maxUnits: 10,
      cooldown: 5,
      coordinates: { x, y },
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

  createMovableBlock = async (coordinates: Coordinates): Promise<GameObject> => {
    const sprite = await this.spriteFactory.createStaticSprite('block');
    console.log(sprite);
    return new Block({
      coordinates,
      sprite,
      movable: true
    });
  };
}
