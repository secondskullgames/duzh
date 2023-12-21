import Ticker from './Ticker';
import { AbilityName } from '../entities/units/abilities/AbilityName';
import Unit from '../entities/units/Unit';
import { checkNotNull } from '../utils/preconditions';
import InventoryItem from '../items/InventoryItem';

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
      this.selectedItem = items[(index + 1) % items.length];
    }
  };

  previousItem = (playerUnit: Unit) => {
    const items = playerUnit.getInventory().get(this.selectedCategory);
    if (items.length > 0 && this.selectedItem !== null) {
      const index = items.indexOf(this.selectedItem);
      this.selectedItem = items[(index - 1 + items.length) % items.length];
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

export class Session {
  private levelUpScreen: LevelUpScreenState | null;
  private inventory: InventoryState | null;
  private readonly ticker: Ticker;

  constructor() {
    this.levelUpScreen = null;
    this.inventory = null;
    this.ticker = new Ticker();
  }

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

  getInventory = (): InventoryState => checkNotNull(this.inventory);
  getTicker = (): Ticker => this.ticker;
}
