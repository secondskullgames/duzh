import { Coordinates } from '@duzh/geometry';
import { AssetBundle, DoorDirection } from '@duzh/models';
import { Game } from '@main/core/Game';
import { loadPaletteSwaps } from '@main/graphics/loadPaletteSwaps';
import SpriteFactory from '@main/graphics/sprites/SpriteFactory';
import MapInstance from '@main/maps/MapInstance';
import { getBonus } from '@main/maps/MapUtils';
import Door, { DoorState } from '@main/objects/Door';
import Shrine from '@main/objects/Shrine';
import { chooseUnitController } from '@main/units/controllers/ControllerUtils';
import { Faction } from '@main/units/Faction';
import Unit from '@main/units/Unit';
import UnitFactory from '@main/units/UnitFactory';
import Block from './Block';
import Bonus from './Bonus';
import GameObject from './GameObject';
import Spawner from './Spawner';

export default class ObjectFactory {
  constructor(
    private readonly assetBundle: AssetBundle,
    private readonly spriteFactory: SpriteFactory,
    private readonly unitFactory: UnitFactory
  ) {}

  createMirror = async (coordinates: Coordinates, map: MapInstance): Promise<Spawner> => {
    const { spriteFactory, unitFactory } = this;

    const sprite = await spriteFactory.createMirrorSprite();
    const spawnFunction = (coordinates: Coordinates) =>
      unitFactory.createUnit({
        modelId: 'shade',
        coordinates: coordinates,
        map,
        level: 1,
        controller: chooseUnitController('shade'),
        faction: Faction.ENEMY
      });
    const spawner = new Spawner({
      name: 'Mirror',
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

  createMovableBlock = async (
    coordinates: Coordinates,
    map: MapInstance
  ): Promise<GameObject> => {
    const sprite = await this.spriteFactory.createStaticSprite('block');

    return new Block({
      name: 'Movable Block',
      coordinates,
      map,
      sprite,
      movable: true
    });
  };

  createVines = async (
    coordinates: Coordinates,
    map: MapInstance
  ): Promise<GameObject> => {
    const sprite = await this.spriteFactory.createStaticSprite('vines');

    return new Block({
      name: 'Vines',
      coordinates,
      map,
      sprite,
      movable: false
    });
  };

  createHealthGlobe = async (
    coordinates: Coordinates,
    map: MapInstance
  ): Promise<GameObject> => {
    const sprite = await this.spriteFactory.createStaticSprite('map_health_globe');

    const lifeToGain = 10;

    const onUse = async (unit: Unit, game: Game) => {
      const { soundController, state, ticker } = game;
      if (unit === state.getPlayerUnit()) {
        if (unit.getLife() < unit.getMaxLife()) {
          const lifeGained = unit.gainLife(lifeToGain);
          soundController.playSound('health_globe');
          ticker.log(
            `${unit.getName()} used a health globe and gained ${lifeGained} life.`,
            {
              turn: state.getTurn()
            }
          );
          const map = unit.getMap();
          const _this = getBonus(map, unit.getCoordinates())!;
          map.removeObject(_this);
        }
      }
    };

    return new Bonus({
      name: 'Health Globe',
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
      loadPaletteSwaps(
        {
          DARK_RED: 'DARK_BLUE',
          RED: 'BLUE'
        },
        this.assetBundle
      )
    );

    const manaToGain = 10;

    const onUse = async (unit: Unit, game: Game) => {
      const { soundController, state, ticker } = game;
      if (unit === state.getPlayerUnit()) {
        if (unit.getMana() < unit.getMaxMana()) {
          const manaGained = unit.gainMana(manaToGain);
          soundController.playSound('health_globe');
          ticker.log(
            `${unit.getName()} used a mana globe and gained ${manaGained} mana.`,
            {
              turn: state.getTurn()
            }
          );
          const map = unit.getMap();
          const _this = getBonus(map, unit.getCoordinates())!;
          map.removeObject(_this);
        }
      }
    };

    return new Bonus({
      name: 'Mana Globe',
      coordinates,
      map,
      sprite,
      onUse
    });
  };

  createVisionGlobe = async (
    coordinates: Coordinates,
    map: MapInstance
  ): Promise<GameObject> => {
    // TODO same colors as mana globe
    const sprite = await this.spriteFactory.createStaticSprite(
      'map_health_globe',
      loadPaletteSwaps(
        {
          DARK_RED: 'DARK_BLUE',
          RED: 'BLUE'
        },
        this.assetBundle
      )
    );

    const radius = 10;

    const onUse = async (unit: Unit, game: Game) => {
      const { soundController, ticker, state } = game;
      if (unit === state.getPlayerUnit()) {
        const playerX = unit.getCoordinates().x;
        const playerY = unit.getCoordinates().y;

        // TODO circle?
        for (let y = playerY - radius; y <= playerY + radius; y++) {
          for (let x = playerX - radius; x <= playerX + radius; x++) {
            if (map.contains({ x, y })) {
              map.revealTile({ x, y });
            }
          }
        }
        soundController.playSound('health_globe');
        ticker.log(`${unit.getName()} used a vision globe and revealed nearby tiles.`, {
          turn: state.getTurn()
        });
        const _this = getBonus(map, unit.getCoordinates())!;
        map.removeObject(_this);
      }
    };

    return new Bonus({
      name: 'Vision Globe',
      coordinates,
      map,
      sprite,
      onUse
    });
  };

  createShrine = async (
    coordinates: Coordinates,
    map: MapInstance
  ): Promise<GameObject> => {
    const sprite = await this.spriteFactory.createShrineSprite();
    const onUse = (game: Game) => {
      const shrineMenuState = game.shrineController.prepareShrineMenu(game);
      game.state.setShrineMenuState(shrineMenuState);
    };

    return new Shrine({
      name: 'Shrine',
      coordinates,
      map,
      sprite,
      onUse
    });
  };

  createDoor = async (
    coordinates: Coordinates,
    direction: DoorDirection,
    locked: boolean,
    map: MapInstance
  ): Promise<Door> => {
    const sprite = await this.spriteFactory.createDoorSprite();

    return new Door({
      name: 'Door',
      direction,
      state: DoorState.CLOSED,
      locked,
      coordinates,
      map,
      sprite
    });
  };
}
