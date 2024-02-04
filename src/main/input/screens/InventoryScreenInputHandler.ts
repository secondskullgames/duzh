import { ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey } from '../inputTypes';
import { toggleFullScreen } from '../../utils/dom';
import { useItem } from '../../actions/useItem';
import { GameScreen } from '../../core/GameScreen';
import { Session } from '../../core/Session';
import { GameState } from '../../core/GameState';

const _handleEnter = async (session: Session, state: GameState) => {
  const playerUnit = session.getPlayerUnit();
  const inventory = session.getInventory();
  const selectedItem = inventory.getSelectedItem();

  if (selectedItem) {
    await useItem(playerUnit, selectedItem, state, session);
    session.prepareInventoryScreen(playerUnit);
  }
};

const InventoryScreenInputHandler: ScreenInputHandler = {
  handleKeyCommand: async (command: KeyCommand, session: Session, state: GameState) => {
    const { key, modifiers } = command;
    const playerUnit = session.getPlayerUnit();
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
          await _handleEnter(session, state);
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
  }
};

export default InventoryScreenInputHandler;
