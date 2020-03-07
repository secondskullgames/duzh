import { EquipmentSlot } from '../../types/types';
import InventoryItem from '../InventoryItem';

class EquippedItem {
  name: string;
  slot: EquipmentSlot;
  inventoryItem: InventoryItem;
  damage: number;

  constructor(name: string, slot: EquipmentSlot, inventoryItem: InventoryItem, damage: number) {
    this.name = name;
    this.slot = slot;
    this.inventoryItem = inventoryItem;
    this.damage = damage;
  }
}

export default EquippedItem;