import { ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey } from '../inputTypes';
import { toggleFullScreen } from '../../utils/dom';
import { GameScreen } from '../../core/GameScreen';
import { Feature } from '../../utils/features';
import { Session } from '../../core/Session';
import { MapController } from '../../maps/MapController';
import { inject, injectable } from 'inversify';

@injectable()
export default class TitleScreenInputHandler implements ScreenInputHandler {
  constructor(
    @inject(Session.SYMBOL)
    private readonly session: Session,
    @inject(MapController.SYMBOL)
    private readonly mapController: MapController
  ) {}

  handleKeyCommand = async (command: KeyCommand) => {
    const { session, mapController } = this;
    const { key, modifiers } = command;

    switch (key) {
      case 'ENTER':
        if (modifiers.includes(ModifierKey.ALT)) {
          await toggleFullScreen();
        } else {
          if (
            Feature.isEnabled(Feature.DEBUG_LEVEL) &&
            modifiers.includes(ModifierKey.SHIFT)
          ) {
            await mapController.loadDebugMap();
          } else {
            await mapController.loadFirstMap();
          }
          session.setScreen(GameScreen.GAME);
        }
        break;
      case 'ESCAPE':
        session.setScreen(GameScreen.GAME);
    }
  };
}
