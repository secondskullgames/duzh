import { ScreenInputHandler } from './ScreenInputHandler';
import { startGameDebug } from '../../actions/startGameDebug';
import { type KeyCommand, ModifierKey } from '../inputTypes';
import { toggleFullScreen } from '../../utils/dom';
import { GameScreen } from '../../core/GameScreen';
import { Feature } from '../../utils/features';
import { Session } from '../../core/Session';
import { GameState } from '../../core/GameState';
import { loadFirstMap } from '../../actions/loadFirstMap';
import MapFactory from '../../maps/MapFactory';
import { inject, injectable } from 'inversify';

@injectable()
export default class TitleScreenInputHandler implements ScreenInputHandler {
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
          if (
            Feature.isEnabled(Feature.DEBUG_LEVEL) &&
            modifiers.includes(ModifierKey.SHIFT)
          ) {
            const mapInstance = await this.mapFactory.loadMap(
              { type: 'predefined', id: 'test' },
              state
            );
            await startGameDebug(mapInstance, session);
          } else {
            await loadFirstMap(session, state);
          }
        }
        session.setScreen(GameScreen.GAME);
        break;
      case 'ESCAPE':
        session.setScreen(GameScreen.GAME);
    }
  };
}
