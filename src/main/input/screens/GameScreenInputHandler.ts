import { ScreenInputHandler } from './ScreenInputHandler';
import { getDirection } from '../inputMappers';
import Coordinates from '../../geometry/Coordinates';
import { ShootArrow } from '../../entities/units/abilities/ShootArrow';
import { Strafe } from '../../entities/units/abilities/Strafe';
import { NormalAttack } from '../../entities/units/abilities/NormalAttack';
import PlayerUnitController from '../../entities/units/controllers/PlayerUnitController';
import { playTurn } from '../../actions/playTurn';
import { ArrowKey, Key, KeyCommand, ModifierKey, NumberKey } from '../inputTypes';
import { playSound } from '../../sounds/playSound';
import Sounds from '../../sounds/Sounds';
import { toggleFullScreen } from '../../utils/dom';
import { checkNotNull } from '../../utils/preconditions';
import { pickupItem } from '../../actions/pickupItem';
import { loadNextMap } from '../../actions/loadNextMap';
import UnitOrder from '../../entities/units/orders/UnitOrder';
import { AbilityOrder } from '../../entities/units/orders/AbilityOrder';
import { AttackMoveOrder } from '../../entities/units/orders/AttackMoveOrder';
import { GameScreen } from '../../core/GameScreen';
import { AbilityName } from '../../entities/units/abilities/AbilityName';
import { getItem } from '../../maps/MapUtils';
import { Feature } from '../../utils/features';
import { FastMoveOrder } from '../../entities/units/orders/FastMoveOrder';
import { Dash } from '../../entities/units/abilities/Dash';
import { loadPreviousMap } from '../../actions/loadPreviousMap';
import { GameState } from '../../core/GameState';
import { Session } from '../../core/Session';

const handleKeyCommand = async (
  command: KeyCommand,
  session: Session,
  state: GameState
) => {
  const { key, modifiers } = command;

  if (_isArrowKey(key)) {
    await _handleArrowKey(key as ArrowKey, modifiers, session, state);
  } else if (_isNumberKey(key)) {
    await _handleAbility(key as NumberKey, session);
  } else if (key === 'SPACEBAR') {
    playSound(Sounds.FOOTSTEP);
    await playTurn(state, session);
  } else if (key === 'TAB') {
    session.prepareInventoryScreen(session.getPlayerUnit());
    session.prepareInventoryV2(session.getPlayerUnit());
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
      await _handleEnter(session, state);
    }
  } else if (key === 'F1') {
    session.setScreen(GameScreen.HELP);
  }
};

const _isArrowKey = (key: Key) => {
  return ['UP', 'DOWN', 'LEFT', 'RIGHT'].includes(key);
};

const _isNumberKey = (key: Key) => {
  return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].includes(key);
};

const _handleArrowKey = async (
  key: ArrowKey,
  modifiers: ModifierKey[],
  session: Session,
  state: GameState
) => {
  const direction = getDirection(key);
  const playerUnit = session.getPlayerUnit();
  const coordinates = Coordinates.plus(playerUnit.getCoordinates(), direction);

  let order: UnitOrder | null = null;
  if (modifiers.includes(ModifierKey.SHIFT)) {
    if (
      playerUnit.getEquipment().getBySlot('RANGED_WEAPON') &&
      playerUnit.canSpendMana(ShootArrow.manaCost)
    ) {
      order = new AbilityOrder({ coordinates, ability: ShootArrow });
    }
  } else if (
    modifiers.includes(ModifierKey.ALT) &&
    Feature.isEnabled(Feature.ALT_STRAFE)
  ) {
    if (playerUnit.canSpendMana(Strafe.manaCost)) {
      // TODO make this into an Order
      order = {
        execute: async (unit, state, session) => {
          await Strafe.use(unit, coordinates, session, state);
        }
      };
    }
  } else if (modifiers.includes(ModifierKey.ALT) && Feature.isEnabled(Feature.ALT_DASH)) {
    if (playerUnit.canSpendMana(Dash.manaCost)) {
      order = new AbilityOrder({ coordinates, ability: Dash });
    }
  } else if (
    modifiers.includes(ModifierKey.CTRL) &&
    Feature.isEnabled(Feature.FAST_MOVE)
  ) {
    order = new FastMoveOrder({ direction });
  } else {
    const ability = session.getQueuedAbility();
    session.setQueuedAbility(null);
    if (ability) {
      order = new AbilityOrder({ ability, coordinates });
    } else {
      order = new AttackMoveOrder({ ability: NormalAttack, coordinates });
    }
  }
  const playerController = playerUnit.getController() as PlayerUnitController;
  if (order) {
    playerController.queueOrder(order);
    await playTurn(state, session);
  }
};

const _handleAbility = async (key: NumberKey, session: Session) => {
  const playerUnit = session.getPlayerUnit();

  const index = parseInt(key.toString());
  const innateAbilities = AbilityName.getInnateAbilities();
  const ability = playerUnit
    .getAbilities()
    .filter(ability => !innateAbilities.includes(ability.name))[index - 1];
  if (ability && playerUnit.canSpendMana(ability.manaCost)) {
    session.setQueuedAbility(ability);
  }
};

const _handleEnter = async (session: Session, state: GameState) => {
  const map = checkNotNull(session.getMap(), 'Map is not loaded!');
  const playerUnit = session.getPlayerUnit();
  const coordinates = playerUnit.getCoordinates();
  const item = getItem(map, coordinates);
  if (item) {
    pickupItem(playerUnit, item, session);
    map.removeObject(item);
  } else if (map.getTile(coordinates).getTileType() === 'STAIRS_DOWN') {
    playSound(Sounds.DESCEND_STAIRS);
    await loadNextMap(session, state);
  } else if (map.getTile(coordinates).getTileType() === 'STAIRS_UP') {
    playSound(Sounds.DESCEND_STAIRS); // TODO
    await loadPreviousMap(session, state);
  }
  await playTurn(state, session);
};

export default {
  handleKeyCommand
} as ScreenInputHandler;
