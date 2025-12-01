import InventoryItem from '../../items/InventoryItem';
import Unit from '../../units/Unit';
import Equipment from '../../equipment/Equipment';
import { ItemCategory } from '@duzh/models';
import { checkNotNull } from '@duzh/utils/preconditions';

export enum InventoryCategory {
  EQUIPMENT = 'EQUIPMENT',
  ITEMS = 'ITEMS'
}

/**
 * Display these in a particular order and don't show keys
 */
export const displayableItemCategories: ItemCategory[] = [
  ItemCategory.WEAPON,
  ItemCategory.ARMOR,
  ItemCategory.POTION,
  ItemCategory.SCROLL
];

export class InventoryState {
  private selectedCategory: InventoryCategory;
  private selectedItemCategory: ItemCategory | null;
  private selectedItem: InventoryItem | null;
  private selectedEquipment: Equipment | null;

  constructor() {
    this.selectedCategory = InventoryCategory.EQUIPMENT;
    this.selectedItemCategory = null;
    this.selectedItem = null;
    this.selectedEquipment = null;
  }

  nextCategory = (playerUnit: Unit) => {
    switch (this.selectedCategory) {
      case InventoryCategory.EQUIPMENT:
        this.selectedCategory = InventoryCategory.ITEMS;
        this.selectedItemCategory = displayableItemCategories[0];
        this.selectedEquipment = null;
        this.selectedItem =
          playerUnit.getInventory().get(this.selectedItemCategory)[0] ?? null;
        break;
      case InventoryCategory.ITEMS: {
        const index =
          this.selectedItemCategory !== null
            ? displayableItemCategories.indexOf(this.selectedItemCategory)
            : -1;
        if (index < displayableItemCategories.length - 1) {
          this.selectedItemCategory = displayableItemCategories[index + 1];
          this.selectedItem =
            playerUnit.getInventory().get(this.selectedItemCategory)[0] ?? null;
        } else {
          this.selectedItemCategory = null;
          this.selectedItem = null;
          this.selectedCategory = InventoryCategory.EQUIPMENT;
          this.selectedEquipment = playerUnit.getEquipment().getAll()[0] ?? null;
        }
        break;
      }
    }
  };

  previousCategory = (playerUnit: Unit) => {
    switch (this.selectedCategory) {
      case InventoryCategory.EQUIPMENT:
        this.selectedCategory = InventoryCategory.ITEMS;
        this.selectedItemCategory =
          displayableItemCategories[displayableItemCategories.length - 1];
        this.selectedEquipment = null;
        break;
      case InventoryCategory.ITEMS: {
        const index =
          this.selectedItemCategory !== null
            ? displayableItemCategories.indexOf(this.selectedItemCategory)
            : -1;
        if (index > 0) {
          this.selectedItemCategory = displayableItemCategories[index - 1];
          this.selectedItem =
            playerUnit.getInventory().get(this.selectedItemCategory)[0] ?? null;
        } else {
          this.selectedItemCategory = null;
          this.selectedItem = null;
          this.selectedCategory = InventoryCategory.EQUIPMENT;
          this.selectedEquipment = playerUnit.getEquipment().getAll()[0] ?? null;
        }
        break;
      }
    }
  };

  selectItemCategory = (itemCategory: ItemCategory) => {
    this.selectedItemCategory = itemCategory;
  };

  nextItem = (playerUnit: Unit) => {
    switch (this.selectedCategory) {
      case InventoryCategory.EQUIPMENT: {
        const equipment = playerUnit.getEquipment().getAll();
        if (this.selectedEquipment) {
          const index = equipment.indexOf(this.selectedEquipment);
          this.selectedEquipment = equipment[(index + 1) % equipment.length];
        } else {
          this.selectedEquipment = equipment[0];
        }
        break;
      }
      case InventoryCategory.ITEMS: {
        const selectedItemCategory = checkNotNull(this.selectedItemCategory);
        const items = playerUnit.getInventory().get(selectedItemCategory);
        if (items.length > 0) {
          const index =
            this.selectedItem !== null ? items.indexOf(this.selectedItem) : -1;
          this.selectedItem = items[(index + 1) % items.length];
        }
      }
    }
  };

  previousItem = (playerUnit: Unit) => {
    switch (this.selectedCategory) {
      case InventoryCategory.EQUIPMENT: {
        const equipment = playerUnit.getEquipment().getAll();
        if (this.selectedEquipment) {
          const index = equipment.indexOf(this.selectedEquipment);
          this.selectedEquipment =
            equipment[(index - 1 + equipment.length) % equipment.length];
        } else {
          this.selectedEquipment = equipment[equipment.length - 1];
        }
        break;
      }
      case InventoryCategory.ITEMS: {
        const selectedItemCategory = checkNotNull(this.selectedItemCategory);
        const items = playerUnit.getInventory().get(selectedItemCategory);
        if (items.length > 0 && this.selectedItem !== null) {
          const index = items.indexOf(this.selectedItem);
          this.selectedItem = items[(index - 1 + items.length) % items.length];
        }
      }
    }
  };

  selectItem = (playerUnit: Unit, itemOrEquipment: InventoryItem | Equipment) => {
    const isEquipment = Object.prototype.hasOwnProperty.call(itemOrEquipment, 'slot');
    if (isEquipment) {
      this.selectedEquipment = itemOrEquipment as Equipment;
      this.selectedCategory = InventoryCategory.EQUIPMENT;
    } else {
      const item = itemOrEquipment as InventoryItem;
      this.selectedItem = item;
      switch (item.category) {
        case ItemCategory.WEAPON:
        case ItemCategory.ARMOR:
        case ItemCategory.POTION:
        case ItemCategory.SCROLL:
          this.selectedItemCategory = item.category;
          this.selectedCategory = InventoryCategory.ITEMS;
          break;
        default: // KEY
          throw new Error('Cannot select key');
      }
    }
  };

  clearSelectedItem = (): void => {
    this.selectedItem = null;
  };

  getSelectedCategory = (): InventoryCategory => this.selectedCategory;
  getItemCategories = (): ItemCategory[] => displayableItemCategories;
  getSelectedItemCategory = (): ItemCategory | null => this.selectedItemCategory;
  getSelectedItem = (): InventoryItem | null => this.selectedItem;
  getItems = (playerUnit: Unit, category: ItemCategory): InventoryItem[] => {
    return playerUnit.getInventory().get(category);
  };
  getSelectedEquipment = (): Equipment | null => this.selectedEquipment;
}
