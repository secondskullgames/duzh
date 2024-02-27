import { ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey } from '../inputTypes';
import { toggleFullScreen } from '@main/utils/dom';
import { useItem } from '@main/actions/useItem';
import { GameScreen, Session, GameState } from '@main/core';
import { inject, injectable } from 'inversify';

@injectable()
export default class InventoryScreenInputHandler implements ScreenInputHandler {
  constructor(
    @inject(Session.SYMBOL)
    private readonly session: Session,
    @inject(GameState.SYMBOL)
    private readonly state: GameState
  ) {}

  handleKeyCommand = async (command: KeyCommand) => {
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
}
