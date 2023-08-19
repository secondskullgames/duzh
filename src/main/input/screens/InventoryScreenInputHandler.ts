import { type ScreenHandlerContext, ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey } from '../inputTypes';
import { toggleFullScreen } from '../../utils/dom';
import { useItem } from '../../actions/useItem';
import { GameScreen } from '../../core/GameScreen';

const handleKeyCommand = async (
  command: KeyCommand,
  context: ScreenHandlerContext
) => {
  const { state } = context;
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
      if (modifiers.includes(ModifierKey.ALT)) {
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

const _handleEnter = async ({ state, spriteFactory, ticker }: ScreenHandlerContext) => {
  const playerUnit = state.getPlayerUnit();
  const map = state.getMap();
  const { selectedItem } = playerUnit.getInventory();

  if (selectedItem) {
    state.setScreen(GameScreen.GAME);
    await useItem(playerUnit, selectedItem, { state, map, spriteFactory, ticker });
  }
};

export default {
  handleKeyCommand
} as ScreenInputHandler;
