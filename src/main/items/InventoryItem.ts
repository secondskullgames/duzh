import { ItemProc, ItemProcContext } from './ItemProc';
import Unit from '../entities/units/Unit';
import ItemCategory from '../schemas/ItemCategory';

type Props = Readonly<{
  name: string;
  category: ItemCategory;
  onUse: ItemProc;
  tooltip?: string;
}>;

export default class InventoryItem {
  readonly name: string;
  readonly category: ItemCategory;
  private readonly tooltip: string | null;
  private readonly onUse: ItemProc;

  constructor({ name, category, onUse, tooltip }: Props) {
    this.name = name;
    this.category = category;
    this.onUse = onUse;
    this.tooltip = tooltip ?? null;
  }

  use = async (unit: Unit, context: ItemProcContext) => {
    await this.onUse(this, unit, context);
  };

  getTooltip = (): string | null => this.tooltip;
}
