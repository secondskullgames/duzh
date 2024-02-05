import Spawner from './Spawner';
import GameObject from './GameObject';
import Block from './Block';
import Bonus from './Bonus';
import { Faction } from '../../types/types';
import BasicEnemyController from '../units/controllers/BasicEnemyController';
import PaletteSwaps from '../../graphics/PaletteSwaps';
import Unit from '../units/Unit';
import { getBonus } from '../../maps/MapUtils';
import { playSound } from '../../sounds/playSound';
import Sounds from '../../sounds/Sounds';
import { GameState } from '../../core/GameState';
import { Session } from '../../core/Session';
import MapInstance from '../../maps/MapInstance';
import type Coordinates from '../../geometry/Coordinates';

export type SpawnerClass = 'mirror';

const createMirror = async (
  coordinates: Coordinates,
  map: MapInstance,
  state: GameState
): Promise<Spawner> => {
  const sprite = await state.getSpriteFactory().createMirrorSprite();
  const spawnFunction = (coordinates: Coordinates) =>
    state.getUnitFactory().createUnit({
      unitClass: 'shade',
      coordinates: coordinates,
      map,
      level: 1,
      controller: new BasicEnemyController(),
      faction: Faction.ENEMY
    });
  const spawner = new Spawner({
    spawnFunction,
    sprite,
    maxUnits: 10,
    cooldown: 5,
    coordinates,
    map,
    isBlocking: true
  });
  sprite.bind(spawner);
  return spawner;
};

const createSpawner = async (
  coordinates: Coordinates,
  map: MapInstance,
  type: SpawnerClass,
  state: GameState
): Promise<Spawner> => {
  switch (type) {
    case 'mirror':
      return createMirror(coordinates, map, state);
    default:
      throw new Error(`Unknown spawner type: ${type}`);
  }
};

const createMovableBlock = async (
  coordinates: Coordinates,
  map: MapInstance,
  state: GameState
): Promise<GameObject> => {
  const sprite = await state
    .getSpriteFactory()
    .createStaticSprite('block', PaletteSwaps.empty());

  return new Block({
    coordinates,
    map,
    sprite,
    movable: true
  });
};

const createHealthGlobe = async (
  coordinates: Coordinates,
  map: MapInstance,
  state: GameState
): Promise<GameObject> => {
  const sprite = await state
    .getSpriteFactory()
    .createStaticSprite('map_health_globe', PaletteSwaps.empty());

  const lifeGained = 10;

  const onUse = async (unit: Unit, _: GameState, session: Session) => {
    if (unit === session.getPlayerUnit()) {
      if (unit.getLife() < unit.getMaxLife()) {
        unit.gainLife(lifeGained);
        playSound(Sounds.HEALTH_GLOBE);
        session
          .getTicker()
          .log(`${unit.getName()} used a health globe and gained ${lifeGained} life.`, {
            turn: session.getTurn()
          });
        const map = session.getMap();
        const _this = getBonus(map, unit.getCoordinates())!;
        map.removeObject(_this);
      }
    }
  };

  return new Bonus({
    coordinates,
    map,
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
