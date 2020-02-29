import { EquipmentCategory } from '../../types/types';
import InventoryItem from '../InventoryItem';

class EquippedItem {
  name: string;
  category: EquipmentCategory;
  inventoryItem: InventoryItem;
  damage: number;

  constructor(name: string, category: EquipmentCategory, inventoryItem: InventoryItem, damage: number) {
    this.name = name;
    this.category = category;
    this.inventoryItem = inventoryItem;
    this.damage = damage;
  }
}

export default EquippedItem;