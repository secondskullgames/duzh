import Ticker from './Ticker';
import { GameScreen } from './GameScreen';
import { AbilityName } from '../entities/units/abilities/AbilityName';
import Unit from '../entities/units/Unit';
import { checkNotNull } from '../utils/preconditions';
import InventoryItem from '../items/InventoryItem';
import EquipmentSlot from '../schemas/EquipmentSlot';
import Equipment from '../equipment/Equipment';
import { sortBy } from '../utils/arrays';

export class LevelUpScreenState {
  private selectedAbility: AbilityName | null;

  constructor() {
    this.selectedAbility = null;
  }

  getSelectedAbility = (): AbilityName | null => this.selectedAbility;

  setSelectedAbility = (ability: AbilityName | null): void => {
    this.selectedAbility = ability;
  };

  selectNextAbility = (playerUnit: Unit) => {
    const learnableAbilities = playerUnit.getLearnableAbilities();
    const index = this.selectedAbility
      ? learnableAbilities.indexOf(this.selectedAbility)
      : -1;
    this.selectedAbility =
      learnableAbilities[(index + 1) % learnableAbilities.length] ?? null;
  };

  selectPreviousAbility = (playerUnit: Unit) => {
    const learnableAbilities = playerUnit.getLearnableAbilities();
    const index = this.selectedAbility
      ? learnableAbilities.indexOf(this.selectedAbility)
      : -1;
    const length = learnableAbilities.length;
    this.selectedAbility = learnableAbilities[(index + length - 1) % length] ?? null;
  };
}

type DisplayCategory = 'WEAPON' | 'ARMOR' | 'POTION' | 'SCROLL';
/**
 * Display these in a particular order and don't show keys
 */
const displayCategories: DisplayCategory[] = ['WEAPON', 'ARMOR', 'POTION', 'SCROLL'];

export class InventoryState {
  private selectedCategory: DisplayCategory;
  private selectedItem: InventoryItem | null;

  constructor() {
    this.selectedCategory = displayCategories[0];
    this.selectedItem = null;
  }

  nextCategory = (playerUnit: Unit) => {
    const index = displayCategories.indexOf(this.selectedCategory);
    this.selectedCategory = displayCategories[(index + 1) % displayCategories.length];
    this.selectedItem = playerUnit.getInventory().get(this.selectedCategory)[0] ?? null;
  };

  previousCategory = (playerUnit: Unit) => {
    const index = displayCategories.indexOf(this.selectedCategory);
    this.selectedCategory =
      displayCategories[
        (index - 1 + displayCategories.length) % displayCategories.length
      ];
    this.selectedItem = playerUnit.getInventory().get(this.selectedCategory)[0] ?? null;
  };

  nextItem = (playerUnit: Unit) => {
    const items = playerUnit.getInventory().get(this.selectedCategory);
    if (items.length > 0) {
      const index = this.selectedItem !== null ? items.indexOf(this.selectedItem) : -1;
      this.selectedItem = items[(index + 1) % items.length] ?? null;
    }
  };

  previousItem = (playerUnit: Unit) => {
    const items = playerUnit.getInventory().get(this.selectedCategory);
    if (items.length > 0 && this.selectedItem !== null) {
      const index = items.indexOf(this.selectedItem);
      this.selectedItem = items[(index - 1 + items.length) % items.length] ?? null;
    }
  };

  clearSelectedItem = (): void => {
    this.selectedItem = null;
  };

  getCategories = (): DisplayCategory[] => displayCategories;
  getSelectedCategory = (): DisplayCategory => this.selectedCategory;
  getSelectedItem = (): InventoryItem | null => this.selectedItem;
  getItems = (playerUnit: Unit, category: DisplayCategory): InventoryItem[] => {
    return playerUnit.getInventory().get(category);
  };
}

const orderedEquipmentSlots: EquipmentSlot[] = [
  'MELEE_WEAPON',
  'RANGED_WEAPON',
  'CHEST',
  'HEAD',
  'SHIELD',
  'LEGS',
  'CLOAK'
];

type InventoryV2Category = 'EQUIPMENT' | 'ITEMS';
type InventoryV2Subcategory = DisplayCategory;

export class InventoryV2State {
  private selectedCategory: InventoryV2Category;
  private selectedItemCategory: InventoryV2Subcategory | null;
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
        this.selectedItem = playerUnit.getInventory().get(this.selectedItemCategory)[0];
        break;
      case 'ITEMS': {
        const index =
          this.selectedItemCategory !== null
            ? displayCategories.indexOf(this.selectedItemCategory)
            : -1;
        if (index < displayCategories.length - 1) {
          this.selectedItemCategory = displayCategories[index + 1];
          this.selectedItem = playerUnit.getInventory().get(this.selectedItemCategory)[0];
        } else {
          this.selectedItemCategory = null;
          this.selectedItem = null;
          this.selectedCategory = 'EQUIPMENT';
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
          this.selectedItem = playerUnit.getInventory().get(this.selectedItemCategory)[0];
        } else {
          this.selectedItemCategory = null;
          this.selectedItem = null;
          this.selectedCategory = 'EQUIPMENT';
        }
        break;
      }
    }
  };

  nextItemCategory = (playerUnit: Unit) => {
    const index =
      this.selectedItemCategory !== null
        ? displayCategories.indexOf(this.selectedItemCategory)
        : -1;
    this.selectedItemCategory = displayCategories[(index + 1) % displayCategories.length];
    this.selectedItem =
      playerUnit.getInventory().get(this.selectedItemCategory)[0] ?? null;
  };

  previousItemCategory = (playerUnit: Unit) => {
    const index =
      this.selectedItemCategory !== null
        ? displayCategories.indexOf(this.selectedItemCategory)
        : -1;
    this.selectedItemCategory =
      displayCategories[
        (index - 1 + displayCategories.length) % displayCategories.length
      ];
    this.selectedItem =
      playerUnit.getInventory().get(this.selectedItemCategory)[0] ?? null;
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

  getSelectedCategory = (): InventoryV2Category => this.selectedCategory;
  getItemCategories = (): InventoryV2Subcategory[] => displayCategories;
  getSelectedItemCategory = (): InventoryV2Subcategory | null =>
    this.selectedItemCategory;
  getSelectedItem = (): InventoryItem | null => this.selectedItem;
  getItems = (playerUnit: Unit, category: DisplayCategory): InventoryItem[] => {
    return playerUnit.getInventory().get(category);
  };
  getSelectedEquipment = (): Equipment | null => this.selectedEquipment;

  private _sortBySlot = (equipment: Equipment[]): Equipment[] => {
    return sortBy(equipment, e => orderedEquipmentSlots.indexOf(e.slot));
  };
}

export class Session {
  private screen: GameScreen;
  private prevScreen: GameScreen | null;
  private levelUpScreen: LevelUpScreenState | null;
  private inventory: InventoryState | null;
  private inventoryV2: InventoryV2State | null;
  private readonly ticker: Ticker;
  private _isTurnInProgress: boolean;

  constructor() {
    this.screen = GameScreen.NONE;
    this.prevScreen = null;
    this.levelUpScreen = null;
    this.inventory = null;
    this.inventoryV2 = null;
    this.ticker = new Ticker();
    this._isTurnInProgress = false;
  }

  getScreen = (): GameScreen => this.screen;
  setScreen = (screen: GameScreen) => {
    this.prevScreen = this.screen;
    this.screen = screen;
  };

  /**
   * TODO: make this a stack
   */
  showPrevScreen = () => {
    if (this.prevScreen) {
      this.screen = this.prevScreen;
      this.prevScreen = null;
    } else {
      this.screen = GameScreen.GAME;
    }
  };

  initLevelUpScreen = (playerUnit: Unit): void => {
    this.levelUpScreen = new LevelUpScreenState();
    this.levelUpScreen.selectNextAbility(playerUnit);
  };

  getLevelUpScreen = (): LevelUpScreenState => checkNotNull(this.levelUpScreen);

  prepareInventoryScreen = (playerUnit: Unit): void => {
    if (this.inventory === null) {
      this.inventory = new InventoryState();
    }
    if (this.inventory.getSelectedCategory() === null) {
      this.inventory.nextCategory(playerUnit);
    }
    if (this.inventory.getSelectedItem() !== null) {
      const selectedItem = this.inventory.getSelectedItem();
      if (selectedItem !== null && !playerUnit.getInventory().includes(selectedItem)) {
        this.inventory.clearSelectedItem();
      }
    }
    if (this.inventory.getSelectedItem() === null) {
      this.inventory.nextItem(playerUnit);
    }
  };

  prepareInventoryV2 = (playerUnit: Unit): void => {
    if (this.inventoryV2 === null) {
      this.inventoryV2 = new InventoryV2State();
    }
    switch (this.inventoryV2.getSelectedCategory()) {
      case 'EQUIPMENT': {
        const equipment = this.inventoryV2.getSelectedEquipment();
        if (equipment !== null && !playerUnit.getEquipment().includes(equipment)) {
          this.inventoryV2.clearSelectedItem();
        }
        if (equipment === null) {
          this.inventoryV2.nextItem(playerUnit);
        }
        break;
      }
      case 'ITEMS': {
        const selectedItem = this.inventoryV2.getSelectedItem();
        if (selectedItem && !playerUnit.getInventory().includes(selectedItem)) {
          this.inventoryV2.clearSelectedItem();
        }
        break;
      }
    }
  };

  getInventory = (): InventoryState => checkNotNull(this.inventory);
  getInventoryV2 = (): InventoryV2State => checkNotNull(this.inventoryV2);
  getTicker = (): Ticker => this.ticker;

  reset = (): void => {
    this.screen = GameScreen.TITLE;
    this.prevScreen = null;
  };

  setTurnInProgress = (val: boolean) => {
    this._isTurnInProgress = val;
  };

  /**
   * Used for showing the "busy" indicator in the UI
   */
  isTurnInProgress = (): boolean => this._isTurnInProgress;
}
