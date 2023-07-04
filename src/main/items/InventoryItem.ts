import Unit from '../entities/units/Unit';
import ItemCategory from '../schemas/ItemCategory';
import { ItemProc } from './ItemProc';
import { GlobalContext } from '../core/GlobalContext';

type Props = Readonly<{
  name: string,
  category: ItemCategory,
  onUse: ItemProc
}>;

export default class InventoryItem {
  readonly name: string;
  readonly category: ItemCategory;
  private readonly _onUse: ItemProc;

  constructor({ name, category, onUse }: Props) {
    this.name = name;
    this.category = category;
    this._onUse = onUse;
  }

  use = async (unit: Unit, context: GlobalContext) => {
    await this._onUse(this, unit, context);
  };
}
