import { KeyCommand } from '../inputTypes';
import { GlobalContext } from '../../core/GlobalContext';

export interface ScreenInputHandler {
  handleKeyCommand: (command: KeyCommand, context: GlobalContext) => Promise<void>;
}