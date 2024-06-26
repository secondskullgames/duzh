import Spawner from './Spawner';
import GameObject from './GameObject';
import Block from './Block';
import Bonus from './Bonus';
import { chooseUnitController } from '@main/units/controllers/ControllerUtils';
import UnitFactory from '@main/units/UnitFactory';
import { Faction } from '@main/units/Faction';
import Sounds from '@main/sounds/Sounds';
import Unit from '@main/units/Unit';
import SpriteFactory from '@main/graphics/sprites/SpriteFactory';
import MapInstance from '@main/maps/MapInstance';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { getBonus } from '@main/maps/MapUtils';
import { loadPaletteSwaps } from '@main/graphics/loadPaletteSwaps';
import { Coordinates } from '@lib/geometry/Coordinates';
import Shrine from '@main/objects/Shrine';
import { ShrineMenuState } from '@main/core/session/ShrineMenuState';
import { checkNotNull } from '@lib/utils/preconditions';
import { randChoice, randInt, sample } from '@lib/utils/random';
import { UnitAbility } from '@main/abilities/UnitAbility';
import { Feature } from '@main/utils/features';
import { AbilityName } from '@main/abilities/AbilityName';
import { inject, injectable } from 'inversify';

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
      loadPaletteSwaps({
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
      loadPaletteSwaps({
        DARK_RED: 'DARK_BLUE',
        RED: 'BLUE'
      })
    );

    const radius = 7;

    const onUse = async (unit: Unit, state: GameState, session: Session) => {
      if (unit === session.getPlayerUnit()) {
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
        state.getSoundPlayer().playSound(Sounds.HEALTH_GLOBE);
        session
          .getTicker()
          .log(`${unit.getName()} used a vision globe and revealed nearby tiles.`, {
            turn: session.getTurn()
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
    const onUse = (shrine: Shrine, state: GameState, session: Session) => {
      const options = [];
      const playerUnit = checkNotNull(session.getPlayerUnit());
      const learnableAbilityNames = playerUnit.getCurrentlyLearnableAbilities();
      const numAbilities = randInt(1, Math.min(learnableAbilityNames.length, 2));
      const selectedAbilityNames = sample(learnableAbilityNames, numAbilities);

      for (const abilityName of selectedAbilityNames) {
        const onUse = async (state: GameState) => {
          // TODO - centralize this logic, it's copy-pasted
          playerUnit.learnAbility(UnitAbility.abilityForName(abilityName));
          if (Feature.isEnabled(Feature.LEVEL_UP_SCREEN)) {
            playerUnit.spendAbilityPoint();
          }
          session.getTicker().log(`Learned ${AbilityName.localize(abilityName)}.`, {
            turn: session.getTurn()
          });
          // TODO
          state.getSoundPlayer().playSound(Sounds.USE_POTION);
        };
        options.push({
          label: AbilityName.localize(abilityName),
          onUse
        });
      }

      const possibleStatOptions = [
        {
          label: '+5 Mana',
          onUse: async (state: GameState) => {
            playerUnit.increaseMaxMana(5);
            // TODO
            state.getSoundPlayer().playSound(Sounds.USE_POTION);
          }
        },
        {
          label: '+10 Life',
          onUse: async (state: GameState) => {
            playerUnit.increaseMaxLife(10);
            // TODO
            state.getSoundPlayer().playSound(Sounds.USE_POTION);
          }
        }
      ];
      if (numAbilities === 2) {
        options.push(randChoice(possibleStatOptions));
      } else {
        options.push(...possibleStatOptions);
      }

      const shrineMenuState = new ShrineMenuState({
        shrine,
        options
      });
      session.setShrineMenuState(shrineMenuState);
    };

    return new Shrine({
      name: 'Shrine',
      coordinates,
      map,
      sprite,
      onActivate: onUse
    });
  };
}
