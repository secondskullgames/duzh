import GameState from '../../core/GameState';
import { KeyCommand } from '../inputTypes';
import Ticker from '../../core/Ticker';
import MapFactory from '../../maps/MapFactory';

export type ScreenHandlerContext = Readonly<{
  state: GameState,
  mapFactory: MapFactory
  ticker: Ticker
}>;

export interface ScreenInputHandler {
  handleKeyCommand: (command: KeyCommand, context: ScreenHandlerContext) => Promise<void>;
}