import Game from '../../core/Game';
import ImageFactory from '../../graphics/images/ImageFactory';
import { KeyCommand } from '../inputTypes';
import Ticker from '../../core/Ticker';
import MapFactory from '../../maps/MapFactory';
import Session from '../../core/Session';

export type ScreenHandlerContext = Readonly<{
  game: Game,
  session: Session,
  imageFactory: ImageFactory,
  mapFactory: MapFactory
  ticker: Ticker
}>;

export interface ScreenInputHandler {
  handleKeyCommand: (command: KeyCommand, context: ScreenHandlerContext) => Promise<void>;
}