import { ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey } from '@lib/input/inputTypes';
import { toggleFullScreen } from '@lib/utils/dom';
import { GameScreen } from '@main/core/GameScreen';
import { Feature } from '@main/utils/features';
import { Session } from '@main/core/Session';
import { MapController } from '@main/maps/MapController';
import { inject, injectable } from 'inversify';

@injectable()
export default class TitleScreenInputHandler implements ScreenInputHandler {
  constructor(
    @inject(Session)
    private readonly session: Session,
    @inject(MapController)
    private readonly mapController: MapController
  ) {}

  handleKeyDown = async (command: KeyCommand) => {
    const { session, mapController } = this;
    const { key, modifiers } = command;

    switch (key) {
      case 'ENTER':
        if (modifiers.includes(ModifierKey.ALT)) {
          await toggleFullScreen();
        } else {
          if (Feature.isEnabled(Feature.DEBUG_LEVEL)) {
            await mapController.loadDebugMap();
          } else {
            await mapController.loadFirstMap();
          }
          session.startGameTimer();
          session.setScreen(GameScreen.GAME);
        }
        break;
    }
  };

  handleKeyUp = async () => {};
}
