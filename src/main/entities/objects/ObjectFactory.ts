import Spawner from './Spawner';
import GameObject from './GameObject';
import Block from './Block';
import Bonus, { OnUseContext } from './Bonus';
import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import UnitFactory from '../units/UnitFactory';
import { Faction } from '../../types/types';
import BasicEnemyController from '../units/controllers/BasicEnemyController';
import PaletteSwaps from '../../graphics/PaletteSwaps';
import Unit from '../units/Unit';
import { getBonus } from '../../maps/MapUtils';
import { playSound } from '../../sounds/playSound';
import Sounds from '../../sounds/Sounds';
import { GameState } from '../../core/GameState';
import type Coordinates from '../../geometry/Coordinates';

export type SpawnerClass = 'mirror';

const createMirror = async (
  coordinates: Coordinates,
  state: GameState
): Promise<Spawner> => {
  const sprite = await SpriteFactory.createMirrorSprite({
    imageFactory: state.getImageFactory()
  });
  const spawnFunction = (coordinates: Coordinates) =>
    UnitFactory.createUnit(
      {
        unitClass: 'shade',
        coordinates: coordinates,
        level: 1,
        controller: new BasicEnemyController(),
        faction: Faction.ENEMY
      },
      state
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
  state: GameState
): Promise<Spawner> => {
  switch (type) {
    case 'mirror':
      return createMirror(coordinates, state);
    default:
      throw new Error(`Unknown spawner type: ${type}`);
  }
};

const createMovableBlock = async (
  coordinates: Coordinates,
  state: GameState
): Promise<GameObject> => {
  const sprite = await SpriteFactory.createStaticSprite('block', PaletteSwaps.empty(), {
    imageFactory: state.getImageFactory()
  });

  return new Block({
    coordinates,
    sprite,
    movable: true
  });
};

const createHealthGlobe = async (
  coordinates: Coordinates,
  state: GameState
): Promise<GameObject> => {
  const sprite = await SpriteFactory.createStaticSprite(
    'map_health_globe',
    PaletteSwaps.empty(),
    { imageFactory: state.getImageFactory() }
  );

  const lifeGained = 10;

  const onUse = async (unit: Unit, { map, session }: OnUseContext) => {
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
