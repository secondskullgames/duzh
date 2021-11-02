import InventoryItem from '../InventoryItem';
import Unit from '../../units/Unit';
import EquipmentModel from './EquipmentModel';
import { EquipmentSlot } from '../../types/types';
import Sprite from '../../graphics/sprites/Sprite';

class Equipment {
  readonly inventoryItem: InventoryItem | null;
  readonly damage?: number;
  readonly sprite: Sprite;
  readonly slot: EquipmentSlot;
  readonly name: string;
  unit?: Unit;

  constructor(model: EquipmentModel, sprite: Sprite, inventoryItem: InventoryItem | null) {
    this.name = model.name;
    this.slot = model.slot;
    this.inventoryItem = inventoryItem;
    this.damage = model.damage;
    this.sprite = sprite;
  }

  attach(unit: Unit) {
    this.unit = unit;
  }
}

export default Equipment;
