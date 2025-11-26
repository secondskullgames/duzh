import { ItemProc } from './ItemProc';
import Unit from '../units/Unit';
import { ItemCategory } from '@duzh/models';
import { Game } from '@main/core/Game';

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

  use = async (unit: Unit, game: Game) => {
    await this.onUse(this, unit, game);
  };

  getTooltip = (): string | null => this.tooltip;
}
