import { type ScreenHandlerContext, ScreenInputHandler } from './ScreenInputHandler';
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
import UnitOrder, { OrderContext } from '../../entities/units/orders/UnitOrder';
import { AbilityOrder } from '../../entities/units/orders/AbilityOrder';
import { AttackMoveOrder } from '../../entities/units/orders/AttackMoveOrder';
import { GameScreen } from '../../core/GameScreen';
import { AbilityName } from '../../entities/units/abilities/AbilityName';
import { getItem } from '../../maps/MapUtils';
import { Feature } from '../../utils/features';
import { FastMoveOrder } from '../../entities/units/orders/FastMoveOrder';
import { Dash } from '../../entities/units/abilities/Dash';
import { FreeMove } from '../../entities/units/abilities/FreeMove';
import Unit from '../../entities/units/Unit';

const handleKeyCommand = async (command: KeyCommand, context: ScreenHandlerContext) => {
  const { key, modifiers } = command;
  const { state, session } = context;
  const map = checkNotNull(state.getMap(), 'Map is not loaded!');

  if (_isArrowKey(key)) {
    await _handleArrowKey(key as ArrowKey, modifiers, context);
  } else if (_isNumberKey(key)) {
    await _handleAbility(key as NumberKey, context);
  } else if (key === 'SPACEBAR') {
    playSound(Sounds.FOOTSTEP);
    await playTurn(true, { ...context, map });
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
      await _handleEnter(context);
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
  { state, session }: ScreenHandlerContext
) => {
  const direction = getDirection(key);
  const playerUnit = session.getPlayerUnit();
  const map = checkNotNull(state.getMap(), 'Map is not loaded!');
  const coordinates = Coordinates.plus(playerUnit.getCoordinates(), direction);

  let order: UnitOrder | null = null;
  let willCompleteTurn: boolean = false;
  if (modifiers.includes(ModifierKey.SHIFT)) {
    if (
      playerUnit.getEquipment().getBySlot('RANGED_WEAPON') &&
      playerUnit.canSpendMana(ShootArrow.manaCost)
    ) {
      order = new AbilityOrder({ coordinates, ability: ShootArrow });
      willCompleteTurn = true;
    }
  } else if (
    modifiers.includes(ModifierKey.ALT) &&
    Feature.isEnabled(Feature.ALT_STRAFE)
  ) {
    if (playerUnit.canSpendMana(Strafe.manaCost)) {
      // TODO make this into an Order
      order = {
        execute: async (_unit, context) => {
          await Strafe.use(playerUnit, coordinates, context);
        }
      };
      willCompleteTurn = true;
    }
  } else if (modifiers.includes(ModifierKey.ALT) && Feature.isEnabled(Feature.ALT_DASH)) {
    if (playerUnit.canSpendMana(Dash.manaCost)) {
      order = new AbilityOrder({ coordinates, ability: Dash });
      willCompleteTurn = true;
    }
  } else if (
    modifiers.includes(ModifierKey.ALT) &&
    Feature.isEnabled(Feature.ALT_FREE_MOVE)
  ) {
    if (playerUnit.canSpendMana(FreeMove.manaCost)) {
      order = new AbilityOrder({ coordinates, ability: FreeMove });
    }
  } else if (modifiers.includes(ModifierKey.ALT) && Feature.isEnabled(Feature.ALT_TURN)) {
    order = {
      execute: async (unit: Unit): Promise<void> => {
        unit.setDirection(direction);
      }
    };
    // don't set willCompleteTurn=true
  } else if (
    modifiers.includes(ModifierKey.CTRL) &&
    Feature.isEnabled(Feature.FAST_MOVE)
  ) {
    order = new FastMoveOrder({ direction });
    willCompleteTurn = true;
  } else {
    const ability = state.getQueuedAbility();
    state.setQueuedAbility(null);
    if (ability) {
      order = new AbilityOrder({ ability, coordinates });
    } else {
      order = new AttackMoveOrder({ ability: NormalAttack, coordinates });
    }
    willCompleteTurn = true;
  }
  const playerController = playerUnit.getController() as PlayerUnitController;
  if (order) {
    playerController.queueOrder(order);
    await playTurn(willCompleteTurn, { state, map, session });
  }
};

const _handleAbility = async (
  key: NumberKey,
  { state, session }: ScreenHandlerContext
) => {
  const playerUnit = session.getPlayerUnit();

  const index = parseInt(key.toString());
  const innateAbilities = AbilityName.getInnateAbilities();
  const ability = playerUnit
    .getAbilities()
    .filter(ability => !innateAbilities.includes(ability.name))[index - 1];
  if (ability && playerUnit.canSpendMana(ability.manaCost)) {
    state.setQueuedAbility(ability);
  }
};

const _handleEnter = async ({ state, session }: ScreenHandlerContext) => {
  const map = checkNotNull(state.getMap(), 'Map is not loaded!');
  const playerUnit = session.getPlayerUnit();
  const coordinates = playerUnit.getCoordinates();
  const item = getItem(map, coordinates);
  if (item) {
    pickupItem(playerUnit, item, { state, session });
    map.removeObject(item);
  } else if (map.getTile(coordinates).getTileType() === 'STAIRS_DOWN') {
    playSound(Sounds.DESCEND_STAIRS);
    await loadNextMap({ state, session });
  }
  await playTurn(false, { state, map, session });
};

export default {
  handleKeyCommand
} as ScreenInputHandler;
