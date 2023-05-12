import Unit from '../entities/units/Unit';
import ItemCategory from '../schemas/ItemCategory';
import { ItemProc, ItemProcContext } from './ItemProc';

type Props = Readonly<{
  name: string,
  category: ItemCategory,
  onUse: ItemProc
}>;

class InventoryItem {
  readonly name: string;
  readonly category: ItemCategory;
  private readonly onUse: ItemProc;

  constructor({ name, category, onUse }: Props) {
    this.name = name;
    this.category = category;
    this.onUse = onUse;
  }

  use = async (
    unit: Unit,
    { state, renderer, imageFactory }: ItemProcContext
  ) => {
    await this.onUse(this, unit, { state, renderer, imageFactory });
  };
}

export default InventoryItem;
