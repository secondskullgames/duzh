import { ScreenInputHandler, type ScreenHandlerContext } from './ScreenInputHandler';
import { type KeyCommand } from '../inputTypes';
import { toggleFullScreen } from '../../utils/dom';
import { useItem } from '../../actions/useItem';
import { GameScreen } from '../../core/GameScreen';

const handleKeyCommand = async (
  command: KeyCommand,
  { state, imageFactory, mapFactory, ticker }: ScreenHandlerContext
) => {
  const { key, modifiers } = command;
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
        await _handleEnter({ state, imageFactory, mapFactory, ticker });
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

const _handleEnter = async ({ state, imageFactory, ticker }: ScreenHandlerContext) => {
  const playerUnit = state.getPlayerUnit();
  const { selectedItem } = playerUnit.getInventory();

  if (selectedItem) {
    state.setScreen(GameScreen.GAME);
    await useItem(playerUnit, selectedItem, { state, imageFactory, ticker });
  }
};

export default {
  handleKeyCommand
} as ScreenInputHandler;
