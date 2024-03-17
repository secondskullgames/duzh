import { ScreenInputHandler } from './ScreenInputHandler';
import { getDirection } from '../inputMappers';
import Sounds from '../../sounds/Sounds';
import PlayerUnitController from '@main/entities/units/controllers/PlayerUnitController';
import UnitOrder from '@main/entities/units/orders/UnitOrder';
import { ArrowKey, Key, KeyCommand, ModifierKey } from '@lib/input/inputTypes';
import { ShootArrow } from '@main/entities/units/abilities/ShootArrow';
import { Strafe } from '@main/entities/units/abilities/Strafe';
import { toggleFullScreen } from '@lib/utils/dom';
import { pickupItem } from '@main/actions/pickupItem';
import { AbilityOrder } from '@main/entities/units/orders/AbilityOrder';
import { GameScreen } from '@main/core/GameScreen';
import { AbilityName } from '@main/entities/units/abilities/AbilityName';
import { getItem } from '@main/maps/MapUtils';
import { Feature } from '@main/utils/features';
import { Dash } from '@main/entities/units/abilities/Dash';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { MapController } from '@main/maps/MapController';
import { AttackMoveBehavior } from '@main/entities/units/behaviors/AttackMoveBehavior';
import { Engine } from '@main/core/Engine';
import { EquipmentSlot } from '@models/EquipmentSlot';
import { TileType } from '@models/TileType';
import { checkNotNull } from '@lib/utils/preconditions';
import { inject, injectable } from 'inversify';

@injectable()
export default class GameScreenInputHandler implements ScreenInputHandler {
  constructor(
    @inject(Engine)
    private readonly engine: Engine,
    @inject(Session)
    private readonly session: Session,
    @inject(GameState)
    private readonly state: GameState,
    @inject(MapController)
    private readonly mapController: MapController
  ) {}

  handleKeyCommand = async (command: KeyCommand) => {
    const { state, session, engine } = this;
    const { key, modifiers } = command;

    if (this._isArrowKey(key)) {
      await this._handleArrowKey(key as ArrowKey, modifiers);
    } else if (this._isAbilityHotkey(key)) {
      await this._handleAbility(key);
    } else if (key === 'SPACEBAR') {
      state.getSoundPlayer().playSound(Sounds.FOOTSTEP);
      await engine.playTurn();
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

  private _isAbilityHotkey = (key: Key) => {
    const abilityKeys: Key[] = [
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '0',
      'Q',
      'E'
    ];
    return abilityKeys.includes(key);
  };

  private _handleArrowKey = async (key: ArrowKey, modifiers: ModifierKey[]) => {
    const { state, session, engine } = this;
    const direction = getDirection(key);
    const playerUnit = session.getPlayerUnit();

    let order: UnitOrder | null = null;
    if (modifiers.includes(ModifierKey.SHIFT)) {
      if (
        playerUnit.getEquipment().getBySlot(EquipmentSlot.RANGED_WEAPON) &&
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
        order = new AttackMoveBehavior({ direction }).issueOrder(
          playerUnit,
          state,
          session
        );
        //order = new AttackMoveOrder({ direction });
      }
    }

    if (order) {
      const playerController = playerUnit.getController() as PlayerUnitController;
      playerController.queueOrder(order);
      await engine.playTurn();
    }
  };

  private _handleAbility = async (hotkey: Key) => {
    const { session } = this;
    const playerUnit = session.getPlayerUnit();
    const playerUnitClass = checkNotNull(playerUnit.getPlayerUnitClass());
    const ability = playerUnitClass.getAbilityForHotkey(hotkey, playerUnit);
    if (ability?.isEnabled(playerUnit)) {
      session.setQueuedAbility(ability);
    }
  };

  private _handleEnter = async () => {
    const { state, session, engine, mapController } = this;
    const map = session.getMap();
    const playerUnit = session.getPlayerUnit();
    const coordinates = playerUnit.getCoordinates();
    const item = getItem(map, coordinates);
    if (item) {
      pickupItem(playerUnit, item, session, state);
      map.removeObject(item);
    } else if (map.getTile(coordinates).getTileType() === TileType.STAIRS_DOWN) {
      state.getSoundPlayer().playSound(Sounds.DESCEND_STAIRS);
      await mapController.loadNextMap();
    } else if (map.getTile(coordinates).getTileType() === TileType.STAIRS_UP) {
      state.getSoundPlayer().playSound(Sounds.DESCEND_STAIRS); // TODO
      await mapController.loadPreviousMap();
    }
    await engine.playTurn();
  };
}
