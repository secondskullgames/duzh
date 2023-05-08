import InputHandlerType, { InputHandlerProps } from './InputHandlerType';
import { KeyCommand } from '../inputTypes';
import { toggleFullScreen } from '../../utils/dom';
import { GameScreen } from '../../types/types';
import { useItem } from '../../actions/useItem';

const handleKeyCommand = async (
  command: KeyCommand,
  { state, renderer, imageFactory }: InputHandlerProps
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
        await _handleEnter({ state, renderer, imageFactory });
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
  }
  await renderer.render();
};

const _handleEnter = async ({ state, renderer, imageFactory }: InputHandlerProps) => {
  const playerUnit = state.getPlayerUnit();
  const { selectedItem } = playerUnit.getInventory();

  if (selectedItem) {
    state.setScreen(GameScreen.GAME);
    await useItem(playerUnit, selectedItem);
  }
};

const InventoryScreenInputHandler: InputHandlerType = {
  handleKeyCommand
};

export default InventoryScreenInputHandler;