import { ScreenInputHandler } from './ScreenInputHandler';
import { getDirection } from '../inputMappers';
import Sounds from '../../sounds/Sounds';
import PlayerUnitController from '@main/units/controllers/PlayerUnitController';
import UnitOrder from '@main/units/orders/UnitOrder';
import { ArrowKey, Key, KeyCommand, ModifierKey } from '@lib/input/inputTypes';
import { toggleFullScreen } from '@lib/utils/dom';
import { pickupItem } from '@main/actions/pickupItem';
import { AbilityOrder } from '@main/units/orders/AbilityOrder';
import { GameScreen } from '@main/core/GameScreen';
import { getItem } from '@main/maps/MapUtils';
import { Feature } from '@main/utils/features';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { MapController } from '@main/maps/MapController';
import { AttackMoveBehavior } from '@main/units/behaviors/AttackMoveBehavior';
import { Engine } from '@main/core/Engine';
import { TileType } from '@models/TileType';
import { checkNotNull } from '@lib/utils/preconditions';
import { isArrowKey, isModifierKey, isNumberKey } from '@lib/input/InputUtils';
import { UnitAbility } from '@main/abilities/UnitAbility';
import { Dash } from '@main/abilities/Dash';
import { AbilityName } from '@main/abilities/AbilityName';
import { Strafe } from '@main/abilities/Strafe';
import { ShootArrow } from '@main/abilities/ShootArrow';
import { inject, injectable } from 'inversify';
import abilityForName = UnitAbility.abilityForName;
import { ShootFrostbolt } from '@main/abilities/ShootFrostbolt';

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

  handleKeyDown = async (command: KeyCommand) => {
    const { state, session, engine } = this;
    const { key, modifiers } = command;

    if (isArrowKey(key)) {
      await this._handleArrowKey(key as ArrowKey, modifiers);
    } else if (isNumberKey(key)) {
      await this._handleAbility(key);
    } else if (isModifierKey(key)) {
      await this._handleModifierKeyDown(key as ModifierKey);
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

  handleKeyUp = async (command: KeyCommand) => {
    const { key } = command;
    if (isModifierKey(key)) {
      await this._handleModifierKeyUp(key as ModifierKey);
    }
  };

  private _handleArrowKey = async (key: ArrowKey, modifiers: ModifierKey[]) => {
    const { state, session, engine } = this;
    const direction = getDirection(key);
    const playerUnit = session.getPlayerUnit();

    let order: UnitOrder | null = null;
    if (modifiers.includes(ModifierKey.SHIFT)) {
      if (
        playerUnit.hasAbility(AbilityName.SHOOT_ARROW) &&
        ShootArrow.isEnabled(playerUnit)
      ) {
        order = new AbilityOrder({ direction, ability: ShootArrow });
      } else if (
        playerUnit.hasAbility(AbilityName.SHOOT_FROSTBOLT) &&
        ShootFrostbolt.isEnabled(playerUnit)
      ) {
        order = new AbilityOrder({ direction, ability: ShootFrostbolt });
      }
    } else if (
      modifiers.includes(ModifierKey.ALT) &&
      Feature.isEnabled(Feature.ALT_STRAFE)
    ) {
      if (Strafe.isEnabled(playerUnit)) {
        order = new AbilityOrder({ direction, ability: Strafe });
      }
    } else if (
      modifiers.includes(ModifierKey.ALT) &&
      Feature.isEnabled(Feature.ALT_DASH)
    ) {
      if (Dash.isEnabled(playerUnit)) {
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

  private _handleModifierKeyDown = async (key: ModifierKey) => {
    const { session } = this;
    const playerUnit = session.getPlayerUnit();
    switch (key) {
      case ModifierKey.SHIFT: {
        for (const abilityName of [
          AbilityName.SHOOT_ARROW,
          AbilityName.SHOOT_FROSTBOLT
        ]) {
          const ability = abilityForName(abilityName);
          if (playerUnit.hasAbility(abilityName) && ability?.isEnabled(playerUnit)) {
            session.setQueuedAbility(ability);
          }
        }
        break;
      }
      case ModifierKey.ALT: {
        const ability = abilityForName(AbilityName.DASH);
        if (ability?.isEnabled(playerUnit)) {
          session.setQueuedAbility(ability);
        }
        break;
      }
    }
  };

  private _handleModifierKeyUp = async (key: ModifierKey) => {
    const { session } = this;
    switch (key) {
      case ModifierKey.SHIFT: {
        if (session.getQueuedAbility()?.name === AbilityName.SHOOT_ARROW) {
          session.setQueuedAbility(null);
        } else if (session.getQueuedAbility()?.name === AbilityName.SHOOT_FROSTBOLT) {
          session.setQueuedAbility(null);
        }
        break;
      }
      case ModifierKey.ALT: {
        if (session.getQueuedAbility()?.name === AbilityName.DASH) {
          session.setQueuedAbility(null);
        }
        break;
      }
    }
  };
}
