import { ScreenInputHandler } from './ScreenInputHandler';
import { getDirection } from '../inputMappers';
import PlayerUnitController from '../../entities/units/controllers/PlayerUnitController';
import { ArrowKey, Key, KeyCommand, ModifierKey, NumberKey } from '../inputTypes';
import Sounds from '../../sounds/Sounds';
import UnitOrder from '../../entities/units/orders/UnitOrder';
import { ShootArrow } from '@main/entities/units/abilities/ShootArrow';
import { Strafe } from '@main/entities/units/abilities/Strafe';
import { playTurn } from '@main/actions/playTurn';
import { toggleFullScreen } from '@main/utils/dom';
import { pickupItem } from '@main/actions/pickupItem';
import { AbilityOrder } from '@main/entities/units/orders/AbilityOrder';
import { AttackMoveOrder } from '@main/entities/units/orders/AttackMoveOrder';
import { GameScreen } from '@main/core/GameScreen';
import { AbilityName } from '@main/entities/units/abilities/AbilityName';
import { getItem } from '@main/maps/MapUtils';
import { Feature } from '@main/utils/features';
import { Dash } from '@main/entities/units/abilities/Dash';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { MapController } from '@main/maps/MapController';
import { getHotkeyAbility } from '@main/entities/units/UnitUtils';
import { inject, injectable } from 'inversify';

@injectable()
export default class GameScreenInputHandler implements ScreenInputHandler {
  constructor(
    @inject(Session.SYMBOL)
    private readonly session: Session,
    @inject(GameState.SYMBOL)
    private readonly state: GameState,
    @inject(MapController.SYMBOL)
    private readonly mapController: MapController
  ) {}

  handleKeyCommand = async (command: KeyCommand) => {
    const { state, session } = this;
    const { key, modifiers } = command;

    if (this._isArrowKey(key)) {
      await this._handleArrowKey(key as ArrowKey, modifiers);
    } else if (this._isNumberKey(key)) {
      await this._handleAbility(key as NumberKey);
    } else if (key === 'SPACEBAR') {
      state.getSoundPlayer().playSound(Sounds.FOOTSTEP);
      await playTurn(state, session);
    } else if (key === 'TAB') {
      session.prepareInventoryScreen(session.getPlayerUnit());
      session.setScreen(GameScreen.INVENTORY);
    } else if (key === 'L' && Feature.isEnabled(Feature.LEVEL_UP_SCREEN)) {
      session.initLevelUpScreen(session.getPlayerUnit());
      session.setScreen(GameScreen.LEVEL_UP);
    } else if (key === 'M') {
      session.setScreen(GameScreen.MAP);
    } else if (key === 'C') {
      session.setScreen(GameScreen.CHARACTER);
    } else if (key === 'ENTER') {
      if (modifiers.includes(ModifierKey.ALT)) {
        await toggleFullScreen();
      } else {
        await this._handleEnter();
      }
    } else if (key === 'F1') {
      session.setScreen(GameScreen.HELP);
    }
  };

  private _isArrowKey = (key: Key) => {
    return ['UP', 'DOWN', 'LEFT', 'RIGHT'].includes(key);
  };

  private _isNumberKey = (key: Key) => {
    return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].includes(key);
  };

  private _handleArrowKey = async (key: ArrowKey, modifiers: ModifierKey[]) => {
    const { state, session } = this;
    const direction = getDirection(key);
    const playerUnit = session.getPlayerUnit();

    let order: UnitOrder | null = null;
    if (modifiers.includes(ModifierKey.SHIFT)) {
      if (
        playerUnit.getEquipment().getBySlot('RANGED_WEAPON') &&
        playerUnit.canSpendMana(ShootArrow.manaCost)
      ) {
        order = new AbilityOrder({ direction, ability: ShootArrow });
      }
    } else if (
      modifiers.includes(ModifierKey.ALT) &&
      Feature.isEnabled(Feature.ALT_STRAFE)
    ) {
      if (playerUnit.canSpendMana(Strafe.manaCost)) {
        order = new AbilityOrder({ direction, ability: Strafe });
      }
    } else if (
      modifiers.includes(ModifierKey.ALT) &&
      Feature.isEnabled(Feature.ALT_DASH)
    ) {
      if (
        playerUnit.hasAbility(AbilityName.DASH) &&
        playerUnit.canSpendMana(Dash.manaCost)
      ) {
        order = new AbilityOrder({ direction, ability: Dash });
      }
    } else {
      const ability = session.getQueuedAbility();
      session.setQueuedAbility(null);
      if (ability) {
        order = new AbilityOrder({ ability, direction });
      } else {
        order = new AttackMoveOrder({ direction });
      }
    }
    const playerController = playerUnit.getController() as PlayerUnitController;
    if (order) {
      playerController.queueOrder(order);
      await playTurn(state, session);
    }
  };

  private _handleAbility = async (key: NumberKey) => {
    const { session } = this;
    const playerUnit = session.getPlayerUnit();
    const ability = getHotkeyAbility(playerUnit, key);
    if (ability && playerUnit.canSpendMana(ability.manaCost)) {
      session.setQueuedAbility(ability);
    }
  };

  private _handleEnter = async () => {
    const { state, session, mapController } = this;
    const map = session.getMap();
    const playerUnit = session.getPlayerUnit();
    const coordinates = playerUnit.getCoordinates();
    const item = getItem(map, coordinates);
    if (item) {
      pickupItem(playerUnit, item, session, state);
      map.removeObject(item);
    } else if (map.getTile(coordinates).getTileType() === 'STAIRS_DOWN') {
      state.getSoundPlayer().playSound(Sounds.DESCEND_STAIRS);
      await mapController.loadNextMap();
    } else if (map.getTile(coordinates).getTileType() === 'STAIRS_UP') {
      state.getSoundPlayer().playSound(Sounds.DESCEND_STAIRS); // TODO
      await mapController.loadPreviousMap();
    }
    await playTurn(state, session);
  };
}
