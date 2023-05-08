import Unit from '../entities/units/Unit';
import InventoryItem from '../items/InventoryItem';
import GameState from '../core/GameState';
import GameRenderer from '../graphics/renderers/GameRenderer';
import ImageFactory from '../graphics/images/ImageFactory';

type Props = Readonly<{
  state: GameState,
  renderer: GameRenderer,
  imageFactory: ImageFactory
}>;

export const useItem = async (
  unit: Unit,
  item: InventoryItem,
  { state, renderer, imageFactory }: Props
) => {
  await item.use(unit, { state, renderer, imageFactory });
  unit.getInventory().remove(item);
};