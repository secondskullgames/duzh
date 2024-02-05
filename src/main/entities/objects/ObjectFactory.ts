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
import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import type Coordinates from '../../geometry/Coordinates';

export type SpawnerClass = 'mirror';

type Props = Readonly<{
  spriteFactory: SpriteFactory;
}>;

export default class ObjectFactory {
  private readonly spriteFactory: SpriteFactory;

  constructor({ spriteFactory }: Props) {
    this.spriteFactory = spriteFactory;
  }

  createMirror = async (
    coordinates: Coordinates,
    map: MapInstance,
    state: GameState
  ): Promise<Spawner> => {
    const sprite = await this.spriteFactory.createMirrorSprite();
    // TODO: Introduces a circular dependency on `unitFactory`
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

  createSpawner = async (
    coordinates: Coordinates,
    map: MapInstance,
    type: SpawnerClass,
    state: GameState
  ): Promise<Spawner> => {
    switch (type) {
      case 'mirror':
        return this.createMirror(coordinates, map, state);
      default:
        throw new Error(`Unknown spawner type: ${type}`);
    }
  };

  createMovableBlock = async (
    coordinates: Coordinates,
    map: MapInstance
  ): Promise<GameObject> => {
    const sprite = await this.spriteFactory.createStaticSprite(
      'block',
      PaletteSwaps.empty()
    );

    return new Block({
      coordinates,
      map,
      sprite,
      movable: true
    });
  };

  createHealthGlobe = async (
    coordinates: Coordinates,
    map: MapInstance
  ): Promise<GameObject> => {
    const sprite = await this.spriteFactory.createStaticSprite(
      'map_health_globe',
      PaletteSwaps.empty()
    );

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
          const map = unit.getMap();
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
}
