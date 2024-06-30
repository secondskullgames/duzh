import { ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey, TouchCommand } from '@lib/input/inputTypes';
import { toggleFullScreen } from '@lib/utils/dom';
import { useItem } from '@main/actions/useItem';
import { GameScreen } from '@main/core/GameScreen';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { inject, injectable } from 'inversify';

@injectable()
export default class InventoryScreenInputHandler implements ScreenInputHandler {
  constructor(
    @inject(Session)
    private readonly session: Session,
    @inject(GameState)
    private readonly state: GameState
  ) {}

  handleKeyDown = async (command: KeyCommand) => {
    const { session } = this;
    const { key, modifiers } = command;
    const playerUnit = session.getPlayerUnit();
    const inventory = session.getInventoryState();

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
          await this._handleEnter();
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

  handleKeyUp = async () => {};

  private _handleEnter = async () => {
    const { state, session } = this;
    const playerUnit = session.getPlayerUnit();
    const inventory = session.getInventoryState();
    const selectedItem = inventory.getSelectedItem();

    if (selectedItem) {
      await useItem(playerUnit, selectedItem, state, session);
      session.prepareInventoryScreen(playerUnit);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleTouchDown = async (_: TouchCommand) => {
    // TODO
  };
}
