import type Coordinates from '../../geometry/Coordinates';
import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import Spawner from './Spawner';
import UnitFactory from '../units/UnitFactory';
import GameObject from './GameObject';
import Block from './Block';
import { Faction } from '../../types/types';
import BasicEnemyController from '../units/controllers/BasicEnemyController';
import ImageFactory from '../../graphics/images/ImageFactory';
import PaletteSwaps from '../../graphics/PaletteSwaps';

export type SpawnerClass = 'mirror';

type Props = Readonly<{
  imageFactory: ImageFactory
}>;

const createMirror = async (
  coordinates: Coordinates,
  { imageFactory }: Props
): Promise<Spawner> => {
  const sprite = await SpriteFactory.createMirrorSprite({ imageFactory });
  const spawnFunction = (coordinates: Coordinates) => UnitFactory.createUnit(
    {
      unitClass: 'shade',
      coordinates: coordinates,
      level: 1,
      controller: new BasicEnemyController(),
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
  { imageFactory }: Props
): Promise<Spawner> => {
  switch (type) {
    case 'mirror':
      return createMirror(coordinates, { imageFactory });
    default:
      throw new Error(`Unknown spawner type: ${type}`);
  }
};

const createMovableBlock = async (
  coordinates: Coordinates,
  { imageFactory }: Props
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
