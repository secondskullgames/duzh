import { ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand } from '../inputTypes';
import { toggleFullScreen } from '../../utils/dom';
import { useItem } from '../../actions/useItem';
import { GameScreen } from '../../core/GameScreen';
import { GlobalContext } from '../../core/GlobalContext';

const handleKeyCommand = async (
  command: KeyCommand,
  context: GlobalContext
) => {
  const { key, modifiers } = command;
  const { state } = context;
  const inventory = state.getPlayerUnit().getInventory();

  switch (key) {
    case 'UP':
      inventory.previousItem();
      break;
    case 'DOWN':
      inventory.nextItem();
      break;
    case 'LEFT':
      inventory.previousCategory();
      break;
    case 'RIGHT':
      inventory.nextCategory();
      break;
    case 'ENTER':
      if (modifiers.includes('ALT')) {
        await toggleFullScreen();
      } else {
        await _handleEnter(context);
      }
      break;
    case 'TAB':
      state.setScreen(GameScreen.GAME);
      break;
    case 'M':
      state.setScreen(GameScreen.MAP);
      break;
    case 'F1':
      state.setScreen(GameScreen.HELP);
      break;
    case 'ESCAPE':
      state.setScreen(GameScreen.GAME);
  }
};

const _handleEnter = async (context: GlobalContext) => {
  const { state } = context;
  const playerUnit = state.getPlayerUnit();
  const { selectedItem } = playerUnit.getInventory();

  if (selectedItem) {
    state.setScreen(GameScreen.GAME);
    await useItem(playerUnit, selectedItem, context);
  }
};

export default {
  handleKeyCommand
} as ScreenInputHandler;
