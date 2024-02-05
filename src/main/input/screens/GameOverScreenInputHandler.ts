import { ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey } from '../inputTypes';
import { showSplashScreen } from '../../actions/showSplashScreen';
import { toggleFullScreen } from '../../utils/dom';
import { GameScreen } from '../../core/GameScreen';
import { Session } from '../../core/Session';
import { GameState } from '../../core/GameState';
import MapFactory from '../../maps/MapFactory';
import { injectable } from 'inversify';

@injectable()
export default class GameOverScreenInputHandler implements ScreenInputHandler {
  constructor(private readonly mapFactory: MapFactory) {}

  handleKeyCommand = async (command: KeyCommand, session: Session, state: GameState) => {
    const { key, modifiers } = command;
    switch (key) {
      case 'ENTER':
        if (modifiers.includes(ModifierKey.ALT)) {
          await toggleFullScreen();
        } else {
          await showSplashScreen(session);
          state.reset();
          session.reset();
          const maps = await this.mapFactory.loadMapSuppliers(state.getMapSpecs(), state);
          state.addMaps(maps);
        }
        break;
      case 'ESCAPE':
        session.setScreen(GameScreen.GAME);
    }
  };
}
