import { type ScreenHandlerContext, ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey } from '../inputTypes';
import { toggleFullScreen } from '../../utils/dom';
import { useItem } from '../../actions/useItem';
import { GameScreen } from '../../core/GameScreen';

const handleKeyCommand = async (command: KeyCommand, context: ScreenHandlerContext) => {
  const { state, session } = context;
  const { key, modifiers } = command;
  const playerUnit = state.getPlayerUnit();
  const inventory = session.getInventory();

  switch (key) {
    case 'UP':
      inventory.previousItem(playerUnit);
      break;
    case 'DOWN':
      inventory.nextItem(playerUnit);
      break;
    case 'LEFT':
      inventory.previousCategory(playerUnit);
      break;
    case 'RIGHT':
      inventory.nextCategory(playerUnit);
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

const _handleEnter = async ({ state, session, imageFactory }: ScreenHandlerContext) => {
  const playerUnit = state.getPlayerUnit();
  const map = state.getMap();
  const inventory = session.getInventory();
  const selectedItem = inventory.getSelectedItem();

  if (selectedItem) {
    if (!['ARMOR', 'WEAPON'].includes(selectedItem.category)) {
      state.setScreen(GameScreen.GAME);
    }

    await useItem(playerUnit, selectedItem, { state, map, imageFactory, session });
    session.prepareInventoryScreen(playerUnit);
  }
};

export default {
  handleKeyCommand
} as ScreenInputHandler;
