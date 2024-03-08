import InventoryItem from '../../items/InventoryItem';
import Unit from '../../entities/units/Unit';
import EquipmentSlot from '../../../models/EquipmentSlot';
import Equipment from '../../equipment/Equipment';
import { checkNotNull } from '@lib/utils/preconditions';
import { sortBy } from '@lib/utils/arrays';

type DisplayCategory = 'WEAPON' | 'ARMOR' | 'POTION' | 'SCROLL';
/**
 * Display these in a particular order and don't show keys
 */
const displayCategories: DisplayCategory[] = ['WEAPON', 'ARMOR', 'POTION', 'SCROLL'];

const orderedEquipmentSlots: EquipmentSlot[] = [
  'MELEE_WEAPON',
  'RANGED_WEAPON',
  'CHEST',
  'HEAD',
  'SHIELD',
  'LEGS',
  'CLOAK'
];

type InventoryCategory = 'EQUIPMENT' | 'ITEMS';
type InventorySubcategory = DisplayCategory;

export class InventoryState {
  private selectedCategory: InventoryCategory;
  private selectedItemCategory: InventorySubcategory | null;
  private selectedItem: InventoryItem | null;
  private selectedEquipment: Equipment | null;

  constructor() {
    this.selectedCategory = 'EQUIPMENT';
    this.selectedItemCategory = null;
    this.selectedItem = null;
    this.selectedEquipment = null;
  }

  nextCategory = (playerUnit: Unit) => {
    switch (this.selectedCategory) {
      case 'EQUIPMENT':
        this.selectedCategory = 'ITEMS';
        this.selectedItemCategory = displayCategories[0];
        this.selectedEquipment = null;
        this.selectedItem =
          playerUnit.getInventory().get(this.selectedItemCategory)[0] ?? null;
        break;
      case 'ITEMS': {
        const index =
          this.selectedItemCategory !== null
            ? displayCategories.indexOf(this.selectedItemCategory)
            : -1;
        if (index < displayCategories.length - 1) {
          this.selectedItemCategory = displayCategories[index + 1];
          this.selectedItem =
            playerUnit.getInventory().get(this.selectedItemCategory)[0] ?? null;
        } else {
          this.selectedItemCategory = null;
          this.selectedItem = null;
          this.selectedCategory = 'EQUIPMENT';
          this.selectedEquipment =
            this._sortBySlot(playerUnit.getEquipment().getAll())[0] ?? null;
        }
        break;
      }
    }
  };

  previousCategory = (playerUnit: Unit) => {
    switch (this.selectedCategory) {
      case 'EQUIPMENT':
        this.selectedCategory = 'ITEMS';
        this.selectedItemCategory = displayCategories[displayCategories.length - 1];
        this.selectedEquipment = null;
        break;
      case 'ITEMS': {
        const index =
          this.selectedItemCategory !== null
            ? displayCategories.indexOf(this.selectedItemCategory)
            : -1;
        if (index > 0) {
          this.selectedItemCategory = displayCategories[index - 1];
          this.selectedItem =
            playerUnit.getInventory().get(this.selectedItemCategory)[0] ?? null;
        } else {
          this.selectedItemCategory = null;
          this.selectedItem = null;
          this.selectedCategory = 'EQUIPMENT';
          this.selectedEquipment =
            this._sortBySlot(playerUnit.getEquipment().getAll())[0] ?? null;
        }
        break;
      }
    }
  };

  nextItem = (playerUnit: Unit) => {
    switch (this.selectedCategory) {
      case 'EQUIPMENT': {
        const equipment = this._sortBySlot(playerUnit.getEquipment().getAll());
        if (this.selectedEquipment) {
          const index = equipment.indexOf(this.selectedEquipment);
          this.selectedEquipment = equipment[(index + 1) % equipment.length];
        } else {
          this.selectedEquipment = equipment[0];
        }
        break;
      }
      case 'ITEMS': {
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
      case 'EQUIPMENT': {
        const equipment = this._sortBySlot(playerUnit.getEquipment().getAll());
        if (this.selectedEquipment) {
          const index = equipment.indexOf(this.selectedEquipment);
          this.selectedEquipment =
            equipment[(index - 1 + equipment.length) % equipment.length];
        } else {
          this.selectedEquipment = equipment[equipment.length - 1];
        }
        break;
      }
      case 'ITEMS': {
        const selectedItemCategory = checkNotNull(this.selectedItemCategory);
        const items = playerUnit.getInventory().get(selectedItemCategory);
        if (items.length > 0 && this.selectedItem !== null) {
          const index = items.indexOf(this.selectedItem);
          this.selectedItem = items[(index - 1 + items.length) % items.length];
        }
      }
    }
  };

  clearSelectedItem = (): void => {
    this.selectedItem = null;
  };

  getSelectedCategory = (): InventoryCategory => this.selectedCategory;
  getItemCategories = (): InventorySubcategory[] => displayCategories;
  getSelectedItemCategory = (): InventorySubcategory | null => this.selectedItemCategory;
  getSelectedItem = (): InventoryItem | null => this.selectedItem;
  getItems = (playerUnit: Unit, category: DisplayCategory): InventoryItem[] => {
    return playerUnit.getInventory().get(category);
  };
  getSelectedEquipment = (): Equipment | null => this.selectedEquipment;

  private _sortBySlot = (equipment: Equipment[]): Equipment[] => {
    return sortBy(equipment, e => orderedEquipmentSlots.indexOf(e.slot));
  };
}
