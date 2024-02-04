import { ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey } from '../inputTypes';
import { showSplashScreen } from '../../actions/showSplashScreen';
import { toggleFullScreen } from '../../utils/dom';
import { GameScreen } from '../../core/GameScreen';
import { addInitialState } from '../../actions/addInitialState';
import { Session } from '../../core/Session';
import { GameState } from '../../core/GameState';

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
        await showSplashScreen(session);
        state.reset();
        session.reset();
        await addInitialState(state, session);
      }
      break;
    case 'ESCAPE':
      session.setScreen(GameScreen.GAME);
  }
};

export default {
  handleKeyCommand
} as ScreenInputHandler;
