import { type ScreenHandlerContext, ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey } from '../inputTypes';
import { toggleFullScreen } from '../../utils/dom';
import { useItem } from '../../actions/useItem';
import { GameScreen } from '../../core/GameScreen';

const handleKeyCommand = async (
  command: KeyCommand,
  { game, session, imageFactory, mapFactory, ticker }: ScreenHandlerContext
) => {
  const { key, modifiers } = command;
  const inventory = game.getPlayerUnit().getInventory();

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
        await _handleEnter({ game, session, imageFactory, mapFactory, ticker });
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

const _handleEnter = async ({ session, game, imageFactory, ticker }: ScreenHandlerContext) => {
  const playerUnit = game.getPlayerUnit();
  const map = game.getMap();
  const { selectedItem } = playerUnit.getInventory();

  if (selectedItem) {
    session.setScreen(GameScreen.GAME);
    await useItem(playerUnit, selectedItem, { game, map, imageFactory, ticker });
  }
};

export default {
  handleKeyCommand
} as ScreenInputHandler;
