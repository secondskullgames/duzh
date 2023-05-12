import GameState from '../../core/GameState';
import GameRenderer from '../../graphics/renderers/GameRenderer';
import ImageFactory from '../../graphics/images/ImageFactory';
import { KeyCommand } from '../inputTypes';

export type ScreenHandlerContext = Readonly<{
  state: GameState,
  renderer: GameRenderer,
  imageFactory: ImageFactory
}>;

export default interface ScreenInputHandler {
  handleKeyCommand: (
    command: KeyCommand,
    { state, renderer, imageFactory }: ScreenHandlerContext
  ) => Promise<void>;
}