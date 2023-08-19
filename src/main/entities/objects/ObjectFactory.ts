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

export type SpawnerClass = 'mirror';

const createMirror = async (coordinates: Coordinates): Promise<Spawner> => {
  const sprite = await SpriteFactory.createMirrorSprite();
  const spawnFunction = (coordinates: Coordinates) => UnitFactory.createUnit({
    unitClass: 'shade',
    coordinates: coordinates,
    level: 1,
    controller: new BasicEnemyController(),
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
  sprite.bind(spawner);
  return spawner;
};

const createSpawner = async (coordinates: Coordinates, type: SpawnerClass): Promise<Spawner> => {
  switch (type) {
    case 'mirror':
      return createMirror(coordinates);
    default:
      throw new Error(`Unknown spawner type: ${type}`);
  }
};

const createMovableBlock = async (coordinates: Coordinates): Promise<GameObject> => {
  const sprite = await SpriteFactory.createStaticSprite('block', PaletteSwaps.empty());

  return new Block({
    coordinates,
    sprite,
    movable: true
  });
};

const createHealthGlobe = async (coordinates: Coordinates): Promise<GameObject> => {
  const sprite = await SpriteFactory.createStaticSprite(
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
