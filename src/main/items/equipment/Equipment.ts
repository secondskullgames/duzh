import InventoryItem from '../InventoryItem';
import Unit from '../../units/Unit';
import EquipmentClass from './EquipmentClass';
import { EquipmentSlot } from '../../types/types';
import Sprite from '../../graphics/sprites/Sprite';

class Equipment {
  readonly inventoryItem: InventoryItem | null;
  readonly damage?: number;
  readonly sprite: Sprite;
  readonly slot: EquipmentSlot;
  readonly name: string;
  unit?: Unit;

  constructor(equipmentClass: EquipmentClass, sprite: Sprite, inventoryItem: InventoryItem | null) {
    this.name = equipmentClass.name;
    this.slot = equipmentClass.slot;
    this.inventoryItem = inventoryItem;
    this.damage = equipmentClass.damage;
    this.sprite = sprite;
  }

  attach(unit: Unit) {
    this.unit = unit;
  }
}

export default Equipment;
