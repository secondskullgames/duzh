import GameState from './GameState';
import ImageFactory from '../graphics/images/ImageFactory';
import Ticker from './Ticker';

/**
 * Screw it
 *
 * Scope: one per game? one per session?
 * Immutable
 */
export type GlobalContext = Readonly<{
  state: GameState,
  imageFactory: ImageFactory,
  ticker: Ticker
}>;