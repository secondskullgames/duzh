import { Feature } from '@duzh/features';
import { Coordinates, Direction } from '@duzh/geometry';
import { ImageFactory } from '@duzh/graphics/images';
import { TileType } from '@duzh/models';
import { checkNotNull } from '@duzh/utils/preconditions';
import { AbilityName } from '@main/abilities/AbilityName';
import { UnitAbility } from '@main/abilities/UnitAbility';
import { getMoveOrAttackOrder } from '@main/actions/getMoveOrAttackOrder';
import { pickupItem } from '@main/actions/pickupItem';
import { Game } from '@main/core/Game';
import { TextRenderer } from '@main/graphics/TextRenderer';
import { Key, ModifierKey } from '@main/input/inputTypes';
import { MapController } from '@main/maps/MapController';
import { getItem, getShrine } from '@main/maps/MapUtils';
import { SceneName } from '@main/scenes/SceneName';
import { SoundController } from '@main/sounds/SoundController';
import PlayerUnitController from '@main/units/controllers/PlayerUnitController';
import { AbilityOrder } from '@main/units/orders/AbilityOrder';
import { UnitOrder } from '@main/units/orders/UnitOrder';
import { isMobileDevice } from '@main/utils/dom';

type Props = Readonly<{
  mapController: MapController;
  imageFactory: ImageFactory;
  textRenderer: TextRenderer;
  soundController: SoundController;
}>;

export class GameController {
  private readonly mapController: MapController;
  private readonly imageFactory: ImageFactory;
  private readonly textRenderer: TextRenderer;
  private readonly soundController: SoundController;

  constructor(props: Props) {
    this.mapController = props.mapController;
    this.imageFactory = props.imageFactory;
    this.textRenderer = props.textRenderer;
    this.soundController = props.soundController;
  }

  handleStartGame = async (game: Game) => {
    const { mapController } = this;
    const { state, ticker } = game;
    if (Feature.isEnabled(Feature.DEBUG_LEVEL)) {
      await mapController.loadDebugMap(game);
    } else {
      await mapController.loadFirstMap(game);
    }
    state.startGameTimer();
    state.setScene(SceneName.GAME);
    ticker.log('Welcome to the Dungeons of Duzh!', { turn: state.getTurn() });
    if (Feature.isEnabled(Feature.GOD_MODE)) {
      const playerUnit = state.getPlayerUnit();
      game.ticker.log('You are a god! Use your power wisely.', { turn: state.getTurn() });
      const sword = await game.itemFactory.createEquipment('god_sword');
      sword.attach(playerUnit);
      playerUnit.getEquipment().add(sword);
      const armor = await game.itemFactory.createEquipment('god_armor');
      armor.attach(playerUnit);
      playerUnit.getEquipment().add(armor);
      // gods don't need instructions
    } else if (isMobileDevice()) {
      ticker.log('Press the ? icon in the upper-right for instructions.', {
        turn: state.getTurn()
      });
    } else {
      ticker.log('Press F1 for instructions.', { turn: state.getTurn() });
    }
  };

  handleDirectionAction = async (direction: Direction, game: Game) => {
    const { state, engine } = game;
    const playerUnit = state.getPlayerUnit();
    const playerController = playerUnit.getController() as PlayerUnitController;
    const coordinates = Coordinates.plusDirection(playerUnit.getCoordinates(), direction);

    let order: UnitOrder | null = null;
    const queuedAbility = state.getQueuedAbility();
    state.setQueuedAbility(null);
    if (queuedAbility) {
      if (
        queuedAbility.isEnabled(playerUnit) &&
        queuedAbility.isLegal(playerUnit, coordinates)
      ) {
        order = AbilityOrder.create({ ability: queuedAbility, direction });
      }
    } else {
      order = getMoveOrAttackOrder(playerUnit, direction);
    }

    if (order) {
      playerController.queueOrder(order);
      await engine.playTurn(game);
    } else {
      this.soundController.playSound('blocked');
    }
  };

  handleShiftDirectionAction = async (direction: Direction, game: Game) => {
    const { state, engine } = game;
    const playerUnit = state.getPlayerUnit();
    const playerController = playerUnit.getController() as PlayerUnitController;
    // TODO need to centralize this logic
    const possibleAbilities = [
      AbilityName.SHOOT_ARROW,
      AbilityName.SHOOT_FIREBOLT,
      AbilityName.SHOOT_FROSTBOLT
    ];
    let order: UnitOrder | undefined = undefined;
    for (const abilityName of possibleAbilities) {
      if (playerUnit.hasAbility(abilityName)) {
        const ability = playerUnit.getAbilityForName(abilityName);
        const coordinates = Coordinates.plusDirection(
          playerUnit.getCoordinates(),
          direction
        );
        if (ability.isEnabled(playerUnit) && ability.isLegal(playerUnit, coordinates)) {
          order = AbilityOrder.create({ direction, ability });
        }
      }
    }

    if (order) {
      playerController.queueOrder(order);
      await engine.playTurn(game);
    } else {
      this.soundController.playSound('blocked');
    }
  };

  handleAltDirectionAction = async (direction: Direction, game: Game) => {
    const { state, engine } = game;
    const playerUnit = state.getPlayerUnit();
    const playerController = playerUnit.getController() as PlayerUnitController;
    const coordinates = Coordinates.plusDirection(playerUnit.getCoordinates(), direction);
    let order: UnitOrder | undefined = undefined;
    if (Feature.isEnabled(Feature.ALT_STRAFE)) {
      if (playerUnit.hasAbility(AbilityName.STRAFE)) {
        const ability = playerUnit.getAbilityForName(AbilityName.STRAFE);
        if (ability.isEnabled(playerUnit) && ability.isLegal(playerUnit, coordinates)) {
          order = AbilityOrder.create({ direction, ability });
        }
      }
    } else if (Feature.isEnabled(Feature.ALT_DASH)) {
      if (playerUnit.hasAbility(AbilityName.DASH)) {
        const ability = playerUnit.getAbilityForName(AbilityName.DASH);
        if (ability.isEnabled(playerUnit) && ability.isLegal(playerUnit, coordinates)) {
          order = AbilityOrder.create({ direction, ability });
        }
      }
    }

    if (order) {
      playerController.queueOrder(order);
      await engine.playTurn(game);
    } else {
      this.soundController.playSound('blocked');
    }
  };

  handleAbilityKey = async (key: Key, game: Game) => {
    const { state } = game;
    const playerUnit = state.getPlayerUnit();
    const playerUnitClass = checkNotNull(playerUnit.getPlayerUnitClass());
    const ability = playerUnitClass.getAbilityForHotkey(key, playerUnit);
    if (ability) {
      await this.handleAbility(ability, game);
    }
  };

  handleAbility = async (ability: UnitAbility, game: Game) => {
    const { state } = game;
    const playerUnit = state.getPlayerUnit();
    if (ability.isEnabled(playerUnit)) {
      if (state.getQueuedAbility() === ability) {
        state.setQueuedAbility(null);
      } else {
        state.setQueuedAbility(ability);
      }
    }
  };

  handleModifierKeyDown = async (key: ModifierKey, game: Game) => {
    const { state } = game;
    const playerUnit = state.getPlayerUnit();
    switch (key) {
      case ModifierKey.SHIFT: {
        for (const abilityName of [
          AbilityName.SHOOT_ARROW,
          // TODO why not SHOOT_FIREBOLT?
          AbilityName.SHOOT_FROSTBOLT
        ]) {
          if (playerUnit.hasAbility(abilityName)) {
            const ability = playerUnit.getAbilityForName(abilityName);
            if (ability?.isEnabled(playerUnit)) {
              state.setQueuedAbility(ability);
            }
          }
        }
        break;
      }
      case ModifierKey.ALT: {
        const ability = playerUnit.getAbilityForName(AbilityName.DASH);
        if (ability?.isEnabled(playerUnit)) {
          state.setQueuedAbility(ability);
        }
        break;
      }
    }
  };

  handleModifierKeyUp = async (key: ModifierKey, game: Game) => {
    const { state } = game;
    switch (key) {
      case ModifierKey.SHIFT: {
        const queuedAbility = state.getQueuedAbility();
        if (queuedAbility) {
          // TODO need to centralize this logic
          const possibleAbilities = [
            AbilityName.SHOOT_ARROW,
            AbilityName.SHOOT_FIREBOLT,
            AbilityName.SHOOT_FROSTBOLT
          ];
          if (possibleAbilities.includes(queuedAbility.name)) {
            state.setQueuedAbility(null);
          }
        }
        break;
      }
      case ModifierKey.ALT: {
        if (state.getQueuedAbility()?.name === AbilityName.DASH) {
          state.setQueuedAbility(null);
        }
        break;
      }
    }
  };

  handleEnter = async (game: Game) => {
    const { mapController, soundController } = this;
    const { state, engine } = game;
    const playerUnit = state.getPlayerUnit();
    const map = playerUnit.getMap();
    const coordinates = playerUnit.getCoordinates();
    const nextCoordinates = Coordinates.plusDirection(
      coordinates,
      playerUnit.getDirection()
    );
    const item = getItem(map, coordinates);
    const shrine = map.contains(nextCoordinates) ? getShrine(map, nextCoordinates) : null;
    if (item) {
      pickupItem(playerUnit, item, game);
      map.removeObject(item);
      await engine.playTurn(game);
    } else if (map.getTile(coordinates).getTileType() === TileType.STAIRS_DOWN) {
      this.soundController.playSound('descend_stairs');
      await mapController.loadNextMap(game);
    } else if (map.getTile(coordinates).getTileType() === TileType.STAIRS_UP) {
      this.soundController.playSound('descend_stairs'); // TODO
      await mapController.loadPreviousMap(game);
    } else if (shrine) {
      shrine.use(game);
    } else {
      // this is mostly a hack to support clicks
      soundController.playSound('footstep');
      await engine.playTurn(game);
    }
  };

  handlePassTurn = async (game: Game) => {
    const { engine } = game;
    this.soundController.playSound('footstep');
    await engine.playTurn(game);
  };

  handleShowInventory = async (game: Game) => {
    const { inventoryController, state } = game;
    inventoryController.prepareInventoryScreen(game);
    state.setScene(SceneName.INVENTORY);
  };
}
