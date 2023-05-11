import { getDirection } from '../inputMappers';
import Coordinates from '../../geometry/Coordinates';
import { ShootArrow } from '../../entities/units/abilities/ShootArrow';
import { Strafe } from '../../entities/units/abilities/Strafe';
import { NormalAttack } from '../../entities/units/abilities/NormalAttack';
import PlayerUnitController from '../../entities/units/controllers/PlayerUnitController';
import { playTurn } from '../../actions/playTurn';
import { ArrowKey, Key, KeyCommand, ModifierKey, NumberKey } from '../inputTypes';
import { playSound } from '../../sounds/SoundFX';
import Sounds from '../../sounds/Sounds';
import { GameScreen } from '../../types/types';
import { toggleFullScreen } from '../../utils/dom';
import { checkNotNull } from '../../utils/preconditions';
import { pickupItem } from '../../actions/pickupItem';
import { loadNextMap } from '../../actions/loadNextMap';
import InputHandlerType, { InputHandlerProps } from './InputHandlerType';

type PromiseSupplier = () => Promise<void>;

const handleKeyCommand = async (
  command: KeyCommand,
  { state, renderer, imageFactory }: InputHandlerProps
) => {
  const { key, modifiers } = command;
  if (_isArrowKey(key)) {
    await _handleArrowKey(key as ArrowKey, modifiers, { state, renderer, imageFactory });
  } else if (_isNumberKey(key)) {
    await _handleAbility(key as NumberKey, { state, renderer, imageFactory });
  } else if (key === 'SPACEBAR') {
    playSound(Sounds.FOOTSTEP);
    await playTurn({ state, renderer, imageFactory });
  } else if (key === 'TAB') {
    state.setScreen(GameScreen.INVENTORY);
    await renderer.render();
  } else if (key === 'M') {
    state.setScreen(GameScreen.MAP);
    await renderer.render();
  } else if (key === 'ENTER') {
    if (modifiers.includes('ALT')) {
      await toggleFullScreen();
    } else {
      await _handleEnter({ state, renderer, imageFactory });
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

const _handleArrowKey = async (key: ArrowKey, modifiers: ModifierKey[], { state, renderer, imageFactory }: InputHandlerProps) => {
  const direction = getDirection(key);
  const playerUnit = state.getPlayerUnit();
  const coordinates = Coordinates.plus(playerUnit.getCoordinates(), direction);

  let order: PromiseSupplier | null = null;
  if (modifiers.includes('SHIFT')) {
    if (playerUnit.getEquipment().getBySlot('RANGED_WEAPON') && playerUnit.canSpendMana(ShootArrow.manaCost)) {
      order = () => ShootArrow.use(
        playerUnit,
        coordinates,
        { state, renderer, imageFactory }
      );
    }
  } else if (modifiers.includes('ALT')) {
    if (playerUnit.canSpendMana(Strafe.manaCost)) {
      order = () => Strafe.use(
        playerUnit,
        coordinates,
        { state, renderer, imageFactory }
      );
    }
  } else {
    const ability = state.getQueuedAbility();
    if (ability !== null) {
      order = async () => {
        state.setQueuedAbility(null);
        await ability.use(
          playerUnit,
          coordinates,
          { state, renderer, imageFactory }
        );
      };
    } else {
      order = () => NormalAttack.use(
        playerUnit,
        coordinates,
        { state, renderer, imageFactory }
      );
    }
  }
  const playerController = playerUnit.getController() as PlayerUnitController;
  if (order) {
    playerController.queueOrder(order);
    await playTurn({ state, renderer, imageFactory });
  }
};

const _handleAbility = async (key: NumberKey, { state, renderer, imageFactory }: InputHandlerProps) => {
  const playerUnit = state.getPlayerUnit();

  // sketchy - player abilities are indexed as (0 => attack, others => specials)
  const index = parseInt(key.toString());
  const ability = playerUnit.getAbilities()
    .filter(ability => ability.icon !== null)
    [index - 1];
  if (ability && playerUnit.canSpendMana(ability.manaCost)) {
    state.setQueuedAbility(ability);
    await renderer.render();
  }
};

const _handleEnter = async ({ state, renderer, imageFactory }: InputHandlerProps) => {
  const map = checkNotNull(state.getMap(), 'Map is not loaded!');
  const playerUnit = state.getPlayerUnit();
  const coordinates = playerUnit.getCoordinates();
  const item = map.getItem(coordinates);
  if (item) {
    pickupItem(playerUnit, item, { state });
    map.removeObject(item);
  } else if (map.getTile(coordinates).getTileType() === 'STAIRS_DOWN') {
    playSound(Sounds.DESCEND_STAIRS);
    await loadNextMap({ state });
  }
  await playTurn({ state, renderer, imageFactory });
};

const GameScreenInputHandler: InputHandlerType = {
  handleKeyCommand
};

export default GameScreenInputHandler;