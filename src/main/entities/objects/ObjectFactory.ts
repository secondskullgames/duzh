import type Coordinates from '../../geometry/Coordinates';
import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import Spawner from './Spawner';
import UnitFactory from '../units/UnitFactory';
import GameState from '../../core/GameState';
import GameObject from './GameObject';
import Block from './Block';
import { Faction } from '../../types/types';
import HumanRedesignController from '../units/controllers/HumanRedesignController';
import ImageFactory from '../../graphics/images/ImageFactory';
import PaletteSwaps from '../../graphics/PaletteSwaps';
import GameRenderer from '../../graphics/renderers/GameRenderer';

export type SpawnerClass = 'mirror';

type Props = Readonly<{
  state: GameState
}>;

export default class ObjectFactory {
  private readonly state: GameState;

  constructor({ state }: Props) {
    this.state = state;
  }

  createMirror = async (coordinates: Coordinates): Promise<Spawner> => {
    const { state } = this;
    const sprite = await SpriteFactory.createMirrorSprite({
      imageFactory: ImageFactory.getInstance()
    });
    const spawnFunction = (coordinates: Coordinates) => UnitFactory.createUnit(
      {
        unitClass: 'shade',
        coordinates: coordinates,
        level: 1,
        controller: new HumanRedesignController({ state }),
        faction: Faction.ENEMY,
      },
      {
        state,
        renderer: GameRenderer.getInstance(),
        imageFactory: ImageFactory.getInstance()
      }
    );
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
    const sprite = await SpriteFactory.createStaticSprite(
      'block',
      PaletteSwaps.empty(),
      { imageFactory: ImageFactory.getInstance() }
    );

    return new Block({
      coordinates,
      sprite,
      movable: true
    });
  };
}
