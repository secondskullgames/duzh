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
import { ScreenInputHandler, type ScreenHandlerContext } from './ScreenInputHandler';
import UnitOrder from '../../entities/units/orders/UnitOrder';
import { AbilityOrder } from '../../entities/units/orders/AbilityOrder';
import { AttackMoveOrder } from '../../entities/units/orders/AttackMoveOrder';
import { GameScreen } from '../../core/GameScreen';
import { AbilityName } from '../../entities/units/abilities/AbilityName';
import { getItem } from '../../maps/MapUtils';
import { Feature } from '../../utils/features';

const handleKeyCommand = async (
  command: KeyCommand,
  context: ScreenHandlerContext
) => {
  const { key, modifiers } = command;
  const { state } = context;

  if (_isArrowKey(key)) {
    await _handleArrowKey(key as ArrowKey, modifiers, context);
  } else if (_isNumberKey(key)) {
    await _handleAbility(key as NumberKey, context);
  } else if (key === 'SPACEBAR') {
    playSound(Sounds.FOOTSTEP);
    await playTurn(context);
  } else if (key === 'TAB') {
    state.setScreen(GameScreen.INVENTORY);
  } else if (key === 'L' && Feature.isEnabled(Feature.LEVEL_UP_SCREEN)) {
    state.setScreen(GameScreen.LEVEL_UP);
  } else if (key === 'M') {
    state.setScreen(GameScreen.MAP);
  } else if (key === 'C') {
    state.setScreen(GameScreen.CHARACTER);
  } else if (key === 'ENTER') {
    if (modifiers.includes('ALT')) {
      await toggleFullScreen();
    } else {
      await _handleEnter(context);
    }
  } else if (key === 'F1') {
    state.setScreen(GameScreen.HELP);
  }
}

const _isArrowKey = (key: Key) => {
  return ['UP', 'DOWN', 'LEFT', 'RIGHT'].includes(key);
};

const _isNumberKey = (key: Key) => {
  return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].includes(key);
};

const _handleArrowKey = async (
  key: ArrowKey,
  modifiers: ModifierKey[],
  { state, imageFactory, ticker }: ScreenHandlerContext
) => {
  const direction = getDirection(key);
  const playerUnit = state.getPlayerUnit();
  const coordinates = Coordinates.plus(playerUnit.getCoordinates(), direction);

  let order: UnitOrder | null = null;
  if (modifiers.includes('SHIFT')) {
    if (playerUnit.getEquipment().getBySlot('RANGED_WEAPON') && playerUnit.canSpendMana(ShootArrow.manaCost)) {
      order = new AbilityOrder({ coordinates, ability: ShootArrow });
    }
  } else if (modifiers.includes('ALT')) {
    if (playerUnit.canSpendMana(Strafe.manaCost)) {
      // TODO make this into an Order
      order = {
        execute: async (unit, { state, imageFactory, ticker }) => {
          await Strafe.use(
            playerUnit,
            coordinates,
            { state, imageFactory, ticker }
          );
        }
      };
    }
  } else {
    const ability = state.getQueuedAbility();
    state.setQueuedAbility(null);
    if (ability) {
      order = new AbilityOrder({ ability, coordinates });
    } else {
      order = new AttackMoveOrder({ ability: NormalAttack, coordinates });
    }
  }
  const playerController = playerUnit.getController() as PlayerUnitController;
  if (order) {
    playerController.queueOrder(order);
    await playTurn({ state, imageFactory, ticker });
  }
};

const _handleAbility = async (key: NumberKey, { state }: ScreenHandlerContext) => {
  const playerUnit = state.getPlayerUnit();

  const index = parseInt(key.toString());
  const innateAbilities = AbilityName.getInnateAbilities();
  const ability = playerUnit.getAbilities()
    .filter(ability => !innateAbilities.includes(ability.name))
    [index - 1];
  if (ability && playerUnit.canSpendMana(ability.manaCost)) {
    state.setQueuedAbility(ability);
  }
};

const _handleEnter = async ({ state, imageFactory, ticker }: ScreenHandlerContext) => {
  const map = checkNotNull(state.getMap(), 'Map is not loaded!');
  const playerUnit = state.getPlayerUnit();
  const coordinates = playerUnit.getCoordinates();
  const item = getItem(map, coordinates);
  if (item) {
    pickupItem(playerUnit, item, { state, ticker });
    map.removeObject(item);
  } else if (map.getTile(coordinates).getTileType() === 'STAIRS_DOWN') {
    playSound(Sounds.DESCEND_STAIRS);
    await loadNextMap({ state });
  }
  await playTurn({ state, imageFactory, ticker });
};

export default {
  handleKeyCommand
} as ScreenInputHandler;