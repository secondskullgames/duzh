import GameState from '../../core/GameState';
import GameRenderer from '../../graphics/renderers/GameRenderer';
import ImageFactory from '../../graphics/images/ImageFactory';
import { KeyCommand } from '../inputTypes';

export type InputHandlerProps = Readonly<{
  state: GameState,
  renderer: GameRenderer,
  imageFactory: ImageFactory
}>;

export default interface InputHandlerType {
  handleKeyCommand: (command: KeyCommand, { state, renderer, imageFactory }: InputHandlerProps) => Promise<void>;
}