import { ItemProc } from './ItemProc';
import ItemCategory from '../schemas/ItemCategory';
import { GameState, Session } from '@main/core';
import { Unit } from '@main/entities/units';

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

  use = async (unit: Unit, state: GameState, session: Session) => {
    await this.onUse(this, unit, state, session);
  };

  getTooltip = (): string | null => this.tooltip;
}
