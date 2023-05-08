import Unit from '../entities/units/Unit';
import InventoryItem from './InventoryItem';
import ImageFactory from '../graphics/images/ImageFactory';
import GameRenderer from '../graphics/renderers/GameRenderer';
import GameState from '../core/GameState';

export type ItemProcProps = Readonly<{
  state: GameState,
  renderer: GameRenderer,
  imageFactory: ImageFactory
}>;

export type ItemProc = (
  item: InventoryItem,
  unit: Unit,
  { state, renderer, imageFactory }: ItemProcProps
) => Promise<void>;