import type Coordinates from '../../geometry/Coordinates';
import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import Spawner from './Spawner';
import UnitFactory from '../units/UnitFactory';
import GameState from '../../core/GameState';
import GameObject from './GameObject';
import Block from './Block';
import { Faction } from '../../types/types';
import HumanRedesignController from '../units/controllers/HumanRedesignController';

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

  createMirror = async (coordinates: Coordinates): Promise<Spawner> => {
    const { state, spriteFactory, unitFactory } = this;
    const sprite = await spriteFactory.createMirrorSprite();
    const spawnFunction = (coordinates: Coordinates) => unitFactory.createUnit({
      unitClass: 'shade',
      coordinates: coordinates,
      level: 1,
      controller: new HumanRedesignController({ state }),
      faction: Faction.ENEMY,
    });
    const spawner = new Spawner({
      spawnFunction,
      sprite,
      maxUnits: 10,
      cooldown: 5,
      coordinates: coordinates,
      isBlocking: true
    });
    sprite.target = spawner;
    return spawner;
  };

 createSpawner = async (coordinates: Coordinates, type: SpawnerClass): Promise<Spawner> => {
    switch (type) {
      case 'mirror':
        return this.createMirror(coordinates);
      default:
        throw new Error(`Unknown spawner type: ${type}`);
    }
  };

  createMovableBlock = async (coordinates: Coordinates): Promise<GameObject> => {
    const sprite = await this.spriteFactory.createStaticSprite('block');
    return new Block({
      coordinates,
      sprite,
      movable: true
    });
  };
}
