import Game from './Game';
import ImageFactory from '../graphics/images/ImageFactory';
import Ticker from './Ticker';

export type GameDefinitionContext = Readonly<{
  imageFactory: ImageFactory,
  ticker: Ticker
}>;

export default interface GameDefinition {
  newGame: (context: GameDefinitionContext) => Promise<Game>;
};