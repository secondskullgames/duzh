import { type ScreenHandlerContext, ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey } from '../inputTypes';
import { toggleFullScreen } from '../../utils/dom';
import { useItem } from '../../actions/useItem';
import { GameScreen } from '../../core/GameScreen';

const handleKeyCommand = async (
  command: KeyCommand,
  { game, imageFactory, mapFactory, ticker }: ScreenHandlerContext
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
        await _handleEnter({ game, imageFactory, mapFactory, ticker });
      }
      break;
    case 'TAB':
      game.setScreen(GameScreen.GAME);
      break;
    case 'M':
      game.setScreen(GameScreen.MAP);
      break;
    case 'F1':
      game.setScreen(GameScreen.HELP);
      break;
    case 'ESCAPE':
      game.setScreen(GameScreen.GAME);
  }
};

const _handleEnter = async ({ game, imageFactory, ticker }: ScreenHandlerContext) => {
  const playerUnit = game.getPlayerUnit();
  const map = game.getMap();
  const { selectedItem } = playerUnit.getInventory();

  if (selectedItem) {
    game.setScreen(GameScreen.GAME);
    await useItem(playerUnit, selectedItem, { game: game, map, imageFactory, ticker });
  }
};

export default {
  handleKeyCommand
} as ScreenInputHandler;
