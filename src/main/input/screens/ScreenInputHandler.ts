import GameState from '../../core/GameState';
import ImageFactory from '../../graphics/images/ImageFactory';
import { KeyCommand } from '../inputTypes';
import Ticker from '../../core/Ticker';
import MapFactory from '../../maps/MapFactory';

export type ScreenHandlerContext = Readonly<{
  state: GameState;
  imageFactory: ImageFactory;
  mapFactory: MapFactory;
  ticker: Ticker;
}>;

export interface ScreenInputHandler {
  handleKeyCommand: (command: KeyCommand, context: ScreenHandlerContext) => Promise<void>;
}
