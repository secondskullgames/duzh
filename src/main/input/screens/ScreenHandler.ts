import GameState from '../../core/GameState';
import GameRenderer from '../../graphics/renderers/GameRenderer';
import ImageFactory from '../../graphics/images/ImageFactory';
import { KeyCommand } from '../inputTypes';

export type ScreenHandlerProps = Readonly<{
  state: GameState,
  renderer: GameRenderer,
  imageFactory: ImageFactory
}>;

export default interface ScreenHandler {
  handleKeyCommand: (command: KeyCommand, { state, renderer, imageFactory }: ScreenHandlerProps) => Promise<void>;
}