import Spawner from './Spawner';
import GameObject from './GameObject';
import Block from './Block';
import Bonus from './Bonus';
import Unit from '../units/Unit';
import Sounds from '../../sounds/Sounds';
import MapInstance from '../../maps/MapInstance';
import UnitFactory from '../units/UnitFactory';
import { Faction } from '../units/Faction';
import { chooseUnitController } from '../units/controllers/ControllerUtils';
import { PaletteSwaps } from '@main/graphics';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { getBonus } from '@main/maps/MapUtils';
import { Coordinates } from '@main/geometry';
import { SpriteFactory } from '@main/graphics/sprites';
import { inject, injectable } from 'inversify';

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
        controller: chooseUnitController('shade'),
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
    const sprite = await this.spriteFactory.createStaticSprite('block');

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
    const sprite = await this.spriteFactory.createStaticSprite('map_health_globe');

    const lifeToGain = 10;

    const onUse = async (unit: Unit, state: GameState, session: Session) => {
      if (unit === session.getPlayerUnit()) {
        if (unit.getLife() < unit.getMaxLife()) {
          const lifeGained = unit.gainLife(lifeToGain);
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

  createManaGlobe = async (
    coordinates: Coordinates,
    map: MapInstance
  ): Promise<GameObject> => {
    const sprite = await this.spriteFactory.createStaticSprite(
      'map_health_globe',
      PaletteSwaps.create({
        DARK_RED: 'DARK_BLUE',
        RED: 'BLUE'
      })
    );

    const manaToGain = 10;

    const onUse = async (unit: Unit, state: GameState, session: Session) => {
      if (unit === session.getPlayerUnit()) {
        if (unit.getMana() < unit.getMaxMana()) {
          const manaGained = unit.gainMana(manaToGain);
          state.getSoundPlayer().playSound(Sounds.HEALTH_GLOBE);
          session
            .getTicker()
            .log(`${unit.getName()} used a mana globe and gained ${manaGained} mana.`, {
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
