import GameState from '../../core/GameState';
import ImageFactory from '../../graphics/images/ImageFactory';
import { KeyCommand } from '../inputTypes';
import Ticker from '../../core/Ticker';
import MapFactory from '../../maps/MapFactory';
import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import AnimationFactory from '../../graphics/animations/AnimationFactory';
import ItemFactory from '../../items/ItemFactory';

export type ScreenHandlerContext = Readonly<{
  state: GameState,
  imageFactory: ImageFactory,
  spriteFactory: SpriteFactory,
  animationFactory: AnimationFactory,
  mapFactory: MapFactory,
  itemFactory: ItemFactory,
  ticker: Ticker
}>;

export interface ScreenInputHandler {
  handleKeyCommand: (command: KeyCommand, context: ScreenHandlerContext) => Promise<void>;
}