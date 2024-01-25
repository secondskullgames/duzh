import Spawner from './Spawner';
import GameObject from './GameObject';
import Block from './Block';
import Bonus, { OnUseContext } from './Bonus';
import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import UnitFactory from '../units/UnitFactory';
import { Faction } from '../../types/types';
import BasicEnemyController from '../units/controllers/BasicEnemyController';
import ImageFactory from '../../graphics/images/ImageFactory';
import PaletteSwaps from '../../graphics/PaletteSwaps';
import Unit from '../units/Unit';
import { getBonus } from '../../maps/MapUtils';
import { playSound } from '../../sounds/playSound';
import Sounds from '../../sounds/Sounds';
import type Coordinates from '../../geometry/Coordinates';

export type SpawnerClass = 'mirror';

type CreateObjectContext = Readonly<{
  imageFactory: ImageFactory;
}>;

const createMirror = async (
  coordinates: Coordinates,
  { imageFactory }: CreateObjectContext
): Promise<Spawner> => {
  const sprite = await SpriteFactory.createMirrorSprite({ imageFactory });
  const spawnFunction = (coordinates: Coordinates) =>
    UnitFactory.createUnit(
      {
        unitClass: 'shade',
        coordinates: coordinates,
        level: 1,
        controller: new BasicEnemyController(),
        faction: Faction.ENEMY
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
  sprite.bind(spawner);
  return spawner;
};

const createSpawner = async (
  coordinates: Coordinates,
  type: SpawnerClass,
  { imageFactory }: CreateObjectContext
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
  { imageFactory }: CreateObjectContext
): Promise<GameObject> => {
  const sprite = await SpriteFactory.createStaticSprite('block', PaletteSwaps.empty(), {
    imageFactory
  });

  return new Block({
    coordinates,
    sprite,
    movable: true
  });
};

const createHealthGlobe = async (
  coordinates: Coordinates,
  { imageFactory }: CreateObjectContext
): Promise<GameObject> => {
  const sprite = await SpriteFactory.createStaticSprite(
    'map_health_globe',
    PaletteSwaps.empty(),
    { imageFactory }
  );

  const lifeGained = 10;

  const onUse = async (unit: Unit, { state, map, session }: OnUseContext) => {
    if (unit === session.getPlayerUnit()) {
      if (unit.getLife() < unit.getMaxLife()) {
        unit.gainLife(lifeGained);
        playSound(Sounds.HEALTH_GLOBE);
        session
          .getTicker()
          .log(`${unit.getName()} used a health globe and gained ${lifeGained} life.`, {
            turn: session.getTurn()
          });
        const _this = getBonus(map, unit.getCoordinates())!;
        map.removeObject(_this);
      }
    }
  };

  return new Bonus({
    coordinates,
    sprite,
    onUse
  });
};

export default {
  createMirror,
  createHealthGlobe,
  createMovableBlock,
  createSpawner
};
