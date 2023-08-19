import { type ScreenHandlerContext, ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey } from '../inputTypes';
import { toggleFullScreen } from '../../utils/dom';
import { GameScreen } from '../../core/GameScreen';
import { Feature } from '../../utils/features';
import { addInitialStateDebug } from '../../actions/addInitialStateDebug';
import { addInitialState } from '../../actions/addInitialState';
import { startGame } from '../../actions/startGame';

const handleKeyCommand = async (
  command: KeyCommand,
  { state, imageFactory, spriteFactory, mapFactory, ticker }: ScreenHandlerContext
) => {
  const { key, modifiers } = command;
  switch (key) {
    case 'ENTER':
      if (modifiers.includes(ModifierKey.ALT)) {
        await toggleFullScreen();
      } else {
        if (Feature.isEnabled(Feature.DEBUG_LEVEL) && modifiers.includes(ModifierKey.SHIFT)) {
          await addInitialStateDebug({ state, spriteFactory, ticker });
        } else {
          await addInitialState({ state, spriteFactory, ticker });
        }
        await startGame({ state, imageFactory, spriteFactory, mapFactory });
        state.setScreen(GameScreen.GAME);
      }
      break;
    case 'ESCAPE':
      state.setScreen(GameScreen.GAME);
  }
};

export default {
  handleKeyCommand
} as ScreenInputHandler;