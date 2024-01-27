import GameState from '../../core/GameState';
import { KeyCommand } from '../inputTypes';
import MapFactory from '../../maps/MapFactory';
import { Session } from '../../core/Session';

export type ScreenHandlerContext = Readonly<{
  state: GameState;
  session: Session;
  mapFactory: MapFactory;
}>;

export interface ScreenInputHandler {
  handleKeyCommand: (command: KeyCommand, context: ScreenHandlerContext) => Promise<void>;
}
