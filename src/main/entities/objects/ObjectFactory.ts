import Spawner from './Spawner';
import GameObject from './GameObject';
import Block from './Block';
import Bonus from './Bonus';
import BasicEnemyController from '../units/controllers/BasicEnemyController';
import PaletteSwaps from '../../graphics/PaletteSwaps';
import Unit from '../units/Unit';
import { getBonus } from '../../maps/MapUtils';
import Sounds from '../../sounds/Sounds';
import { GameState } from '../../core/GameState';
import { Session } from '../../core/Session';
import MapInstance from '../../maps/MapInstance';
import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import UnitFactory from '../units/UnitFactory';
import { Faction } from '../units/Faction';
import { inject, injectable } from 'inversify';
import type Coordinates from '../../geometry/Coordinates';

export type SpawnerClass = 'mirror';

@injectable()
export default class ObjectFactory {
  constructor(
    @inject(SpriteFactory)
    private readonly spriteFactory: SpriteFactory,
    @inject(UnitFactory)
    private readonly unitFactory: UnitFactory
  ) {}

  createMirror = async (coordinates: Coordinates, map: MapInstance): Promise<Spawner> => {
    const { spriteFactory, unitFactory } = this;

    const sprite = await spriteFactory.createMirrorSprite();
    const spawnFunction = (coordinates: Coordinates) =>
      unitFactory.createUnit({
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
    type: SpawnerClass
  ): Promise<Spawner> => {
    switch (type) {
      case 'mirror':
        return this.createMirror(coordinates, map);
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

    const lifeGained = 3;

    const onUse = async (unit: Unit, state: GameState, session: Session) => {
      if (unit === session.getPlayerUnit()) {
        if (unit.getLife() < unit.getMaxLife()) {
          unit.gainLife(lifeGained);
          state.getSoundPlayer().playSound(Sounds.HEALTH_GLOBE);
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
