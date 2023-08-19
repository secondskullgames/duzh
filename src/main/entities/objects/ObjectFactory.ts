import type Coordinates from '../../geometry/Coordinates';
import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import Spawner from './Spawner';
import UnitFactory from '../units/UnitFactory';
import GameObject from './GameObject';
import Block from './Block';
import { Faction } from '../../types/types';
import BasicEnemyController from '../units/controllers/BasicEnemyController';
import PaletteSwaps from '../../graphics/PaletteSwaps';
import Bonus, { OnUseContext } from './Bonus';
import Unit from '../units/Unit';
import { getBonus } from '../../maps/MapUtils';
import { playSound } from '../../sounds/playSound';
import Sounds from '../../sounds/Sounds';
import ItemFactory from '../../items/ItemFactory';

export type SpawnerClass = 'mirror';

type CreateObjectContext = Readonly<{
  spriteFactory: SpriteFactory,
  itemFactory: ItemFactory
}>;

const createMirror = async (
  coordinates: Coordinates,
  { spriteFactory, itemFactory }: CreateObjectContext
): Promise<Spawner> => {
  const sprite = await spriteFactory.createMirrorSprite();
  const spawnFunction = (coordinates: Coordinates) => UnitFactory.createUnit(
    {
      unitClass: 'shade',
      coordinates: coordinates,
      level: 1,
      controller: new BasicEnemyController(),
      faction: Faction.ENEMY,
    },
    { spriteFactory, itemFactory }
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
  { spriteFactory, itemFactory }: CreateObjectContext
): Promise<Spawner> => {
  switch (type) {
    case 'mirror':
      return createMirror(coordinates, { spriteFactory, itemFactory });
    default:
      throw new Error(`Unknown spawner type: ${type}`);
  }
};

const createMovableBlock = async (
  coordinates: Coordinates,
  { spriteFactory }: CreateObjectContext
): Promise<GameObject> => {
  const sprite = await spriteFactory.createStaticSprite(
    'block',
    PaletteSwaps.empty()
  );

  return new Block({
    coordinates,
    sprite,
    movable: true
  });
};

const createHealthGlobe = async (
  coordinates: Coordinates,
  { spriteFactory }: CreateObjectContext
): Promise<GameObject> => {
  const sprite = await spriteFactory.createStaticSprite(
    'map_health_globe',
    PaletteSwaps.empty()
  );

  const lifeGained = 10;

  const onUse = async (unit: Unit, { state, map, ticker }: OnUseContext) => {
    if (unit === state.getPlayerUnit()) {
      if (unit.getLife() < unit.getMaxLife()) {
        unit.gainLife(lifeGained);
        playSound(Sounds.HEALTH_GLOBE);
        ticker.log(
          `${unit.getName()} used a health globe and gained ${lifeGained} life.`,
          { turn: state.getTurn() }
        );
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
