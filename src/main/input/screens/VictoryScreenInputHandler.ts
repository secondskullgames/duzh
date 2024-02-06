import { ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey } from '../inputTypes';
import { showSplashScreen } from '../../actions/showSplashScreen';
import { toggleFullScreen } from '../../utils/dom';
import { GameScreen } from '../../core/GameScreen';
import { Session } from '../../core/Session';
import { GameState } from '../../core/GameState';
import MapFactory from '../../maps/MapFactory';
import { inject, injectable } from 'inversify';

@injectable()
export default class VictoryScreenInputHandler implements ScreenInputHandler {
  constructor(
    @inject(Session.SYMBOL)
    private readonly session: Session,
    @inject(GameState.SYMBOL)
    private readonly state: GameState,
    @inject(MapFactory)
    private readonly mapFactory: MapFactory
  ) {}

  handleKeyCommand = async (command: KeyCommand) => {
    const { state, session } = this;
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
