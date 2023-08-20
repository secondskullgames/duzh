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
import { type ScreenHandlerContext, ScreenInputHandler } from './ScreenInputHandler';
import UnitOrder from '../../entities/units/orders/UnitOrder';
import { AbilityOrder } from '../../entities/units/orders/AbilityOrder';
import { AttackMoveOrder } from '../../entities/units/orders/AttackMoveOrder';
import { GameScreen } from '../../core/GameScreen';
import { AbilityName } from '../../entities/units/abilities/AbilityName';
import { getItem } from '../../maps/MapUtils';
import { Feature } from '../../utils/features';
import { FastMoveOrder } from '../../entities/units/orders/FastMoveOrder';

const handleKeyCommand = async (
  command: KeyCommand,
  context: ScreenHandlerContext
) => {
  const { key, modifiers } = command;
  const { game } = context;
  const map = checkNotNull(game.getMap(), 'Map is not loaded!');

  if (_isArrowKey(key)) {
    await _handleArrowKey(key as ArrowKey, modifiers, context);
  } else if (_isNumberKey(key)) {
    await _handleAbility(key as NumberKey, context);
  } else if (key === 'SPACEBAR') {
    playSound(Sounds.FOOTSTEP);
    await playTurn({ ...context, map });
  } else if (key === 'TAB') {
    game.setScreen(GameScreen.INVENTORY);
  } else if (key === 'L' && Feature.isEnabled(Feature.LEVEL_UP_SCREEN)) {
    game.setScreen(GameScreen.LEVEL_UP);
  } else if (key === 'M') {
    game.setScreen(GameScreen.MAP);
  } else if (key === 'C') {
    game.setScreen(GameScreen.CHARACTER);
  } else if (key === 'ENTER') {
    if (modifiers.includes(ModifierKey.ALT)) {
      await toggleFullScreen();
    } else {
      await _handleEnter(context);
    }
  } else if (key === 'F1') {
    game.setScreen(GameScreen.HELP);
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
  { game, imageFactory, ticker }: ScreenHandlerContext
) => {
  const direction = getDirection(key);
  const playerUnit = game.getPlayerUnit();
  const map = checkNotNull(game.getMap(), 'Map is not loaded!');
  const coordinates = Coordinates.plus(playerUnit.getCoordinates(), direction);

  let order: UnitOrder | null = null;
  if (modifiers.includes(ModifierKey.SHIFT)) {
    if (playerUnit.getEquipment().getBySlot('RANGED_WEAPON') && playerUnit.canSpendMana(ShootArrow.manaCost)) {
      order = new AbilityOrder({ coordinates, ability: ShootArrow });
    }
  } else if (modifiers.includes(ModifierKey.ALT)) {
    if (playerUnit.canSpendMana(Strafe.manaCost)) {
      // TODO make this into an Order
      order = {
        execute: async (unit, context) => {
          await Strafe.use(playerUnit, coordinates, context);
        }
      };
    }
  } else if (modifiers.includes(ModifierKey.CTRL) && Feature.isEnabled(Feature.FAST_MOVE)) {
    order = new FastMoveOrder({ direction });
  } else {
    const ability = game.getQueuedAbility();
    game.setQueuedAbility(null);
    if (ability) {
      order = new AbilityOrder({ ability, coordinates });
    } else {
      order = new AttackMoveOrder({ ability: NormalAttack, coordinates });
    }
  }
  const playerController = playerUnit.getController() as PlayerUnitController;
  if (order) {
    playerController.queueOrder(order);
    await playTurn({ game, map, imageFactory, ticker });
  }
};

const _handleAbility = async (key: NumberKey, { game }: ScreenHandlerContext) => {
  const playerUnit = game.getPlayerUnit();

  const index = parseInt(key.toString());
  const innateAbilities = AbilityName.getInnateAbilities();
  const ability = playerUnit.getAbilities()
    .filter(ability => !innateAbilities.includes(ability.name))
    [index - 1];
  if (ability && playerUnit.canSpendMana(ability.manaCost)) {
    game.setQueuedAbility(ability);
  }
};

const _handleEnter = async ({ game, imageFactory, mapFactory, ticker }: ScreenHandlerContext) => {
  const map = checkNotNull(game.getMap(), 'Map is not loaded!');
  const playerUnit = game.getPlayerUnit();
  const coordinates = playerUnit.getCoordinates();
  const item = getItem(map, coordinates);
  if (item) {
    pickupItem(playerUnit, item, { game, ticker });
    map.removeObject(item);
  } else if (map.getTile(coordinates).getTileType() === 'STAIRS_DOWN') {
    playSound(Sounds.DESCEND_STAIRS);
    await loadNextMap({ game, imageFactory, mapFactory });
  }
  await playTurn({ game, map, imageFactory, ticker });
};

export default {
  handleKeyCommand
} as ScreenInputHandler;