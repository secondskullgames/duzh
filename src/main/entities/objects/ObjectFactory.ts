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
  state: GameState,
  renderer: GameRenderer,
  imageFactory: ImageFactory
}>;

const createMirror = async (
  coordinates: Coordinates,
  { state, renderer, imageFactory }: Props
): Promise<Spawner> => {
  const sprite = await SpriteFactory.createMirrorSprite({ imageFactory });
  const spawnFunction = (coordinates: Coordinates) => UnitFactory.createUnit(
    {
      unitClass: 'shade',
      coordinates: coordinates,
      level: 1,
      controller: new HumanRedesignController(),
      faction: Faction.ENEMY,
    },
    { imageFactory }
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

const createSpawner = async (
  coordinates: Coordinates,
  type: SpawnerClass,
  { state, renderer, imageFactory }: Props
): Promise<Spawner> => {
  switch (type) {
    case 'mirror':
      return createMirror(coordinates, { state, renderer, imageFactory });
    default:
      throw new Error(`Unknown spawner type: ${type}`);
  }
};

const createMovableBlock = async (
  coordinates: Coordinates,
  { state, renderer, imageFactory }: Props
): Promise<GameObject> => {
  const sprite = await SpriteFactory.createStaticSprite(
    'block',
    PaletteSwaps.empty(),
    { imageFactory }
  );

  return new Block({
    coordinates,
    sprite,
    movable: true
  });
};

export default {
  createMirror,
  createMovableBlock,
  createSpawner
};
