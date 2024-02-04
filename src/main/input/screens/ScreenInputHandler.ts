import { GameState } from '../../core/GameState';
import { KeyCommand } from '../inputTypes';
import { Session } from '../../core/Session';

export interface ScreenInputHandler {
  handleKeyCommand: (
    command: KeyCommand,
    session: Session,
    state: GameState
  ) => Promise<void>;
}
