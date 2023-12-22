import { type ScreenHandlerContext, ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey } from '../inputTypes';
import { toggleFullScreen } from '../../utils/dom';
import { useItem } from '../../actions/useItem';
import { GameScreen } from '../../core/GameScreen';

const handleKeyCommand = async (command: KeyCommand, context: ScreenHandlerContext) => {
  const { state, session } = context;
  const { key, modifiers } = command;
  const playerUnit = state.getPlayerUnit();
  const inventory = session.getInventoryV2();

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
      session.setScreen(GameScreen.GAME);
      break;
    case 'M':
      session.setScreen(GameScreen.MAP);
      break;
    case 'F1':
      session.setScreen(GameScreen.HELP);
      break;
    case 'ESCAPE':
      session.setScreen(GameScreen.GAME);
  }
};

const _handleEnter = async ({ state, session, imageFactory }: ScreenHandlerContext) => {
  const playerUnit = state.getPlayerUnit();
  const map = state.getMap();
  const inventory = session.getInventoryV2();
  const selectedItem = inventory.getSelectedItem();

  if (selectedItem) {
    await useItem(playerUnit, selectedItem, { state, map, imageFactory, session });
    session.prepareInventoryV2(playerUnit);
  }
};

export default {
  handleKeyCommand
} as ScreenInputHandler;
