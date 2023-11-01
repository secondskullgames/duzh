import { ItemProc, ItemProcContext } from './ItemProc';
import Unit from '../entities/units/Unit';
import ItemCategory from '../schemas/ItemCategory';

type Props = Readonly<{
  name: string;
  category: ItemCategory;
  onUse: ItemProc;
}>;

export default class InventoryItem {
  readonly name: string;
  readonly category: ItemCategory;
  private readonly onUse: ItemProc;

  constructor({ name, category, onUse }: Props) {
    this.name = name;
    this.category = category;
    this.onUse = onUse;
  }

  use = async (unit: Unit, context: ItemProcContext) => {
    await this.onUse(this, unit, context);
  };
}
