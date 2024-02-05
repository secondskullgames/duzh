import { ScreenInputHandler } from './ScreenInputHandler';
import { startGameDebug } from '../../actions/startGameDebug';
import { type KeyCommand, ModifierKey } from '../inputTypes';
import { toggleFullScreen } from '../../utils/dom';
import { GameScreen } from '../../core/GameScreen';
import { Feature } from '../../utils/features';
import { Session } from '../../core/Session';
import { GameState } from '../../core/GameState';
import { loadFirstMap } from '../../actions/loadFirstMap';

const handleKeyCommand = async (
  command: KeyCommand,
  session: Session,
  state: GameState
) => {
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
          const mapFactory = state.getMapFactory();
          const mapInstance = await mapFactory.loadMap(
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

export default {
  handleKeyCommand
} as ScreenInputHandler;
