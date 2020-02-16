import { EquipmentCategory } from '../types';
import InventoryItem from './InventoryItem';

class EquippedItem {
  name: string;
  category: EquipmentCategory;
  inventoryItem: InventoryItem;
  damage: number;

  constructor(name, category, inventoryItem, damage) {
    this.name = name;
    this.category = category;
    this.inventoryItem = inventoryItem;
    this.damage = damage;
  }
}

export default EquippedItem;