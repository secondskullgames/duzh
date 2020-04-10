import { EquipmentSlot, ItemCategory, PaletteSwaps, SpriteSupplier } from '../../types/types';
import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import Colors from '../../types/Colors';

interface EquipmentClass {
  name: string,
  itemCategory: ItemCategory,
  equipmentCategory: EquipmentSlot,
  mapIcon: SpriteSupplier,
  char: string,
  paletteSwaps?: PaletteSwaps,
  minLevel: number,
  maxLevel: number,
  damage: number
}

const BRONZE_SWORD: EquipmentClass = {
  name: 'Bronze Sword',
  char: 'S',
  itemCategory: ItemCategory.WEAPON,
  equipmentCategory: EquipmentSlot.MELEE_WEAPON,
  mapIcon: SpriteFactory.MAP_SWORD,
  paletteSwaps: {
    [Colors.BLACK]: Colors.BLACK,
    [Colors.DARK_GRAY]: Colors.LIGHT_BROWN,
    [Colors.LIGHT_GRAY]: Colors.LIGHT_BROWN
  },
  damage: 4,
  minLevel: 1,
  maxLevel: 2
};

const IRON_SWORD: EquipmentClass = {
  name: 'Iron Sword',
  char: 'S',
  itemCategory: ItemCategory.WEAPON,
  equipmentCategory: EquipmentSlot.MELEE_WEAPON,
  mapIcon: SpriteFactory.MAP_SWORD,
  paletteSwaps: {
    [Colors.DARK_GRAY]: Colors.BLACK,
    [Colors.LIGHT_GRAY]: Colors.DARK_GRAY
  },
  damage: 6,
  minLevel: 3,
  maxLevel: 4
};

const STEEL_SWORD: EquipmentClass = {
  name: 'Steel Sword',
  char: 'S',
  itemCategory: ItemCategory.WEAPON,
  equipmentCategory: EquipmentSlot.MELEE_WEAPON,
  mapIcon: SpriteFactory.MAP_SWORD,
  paletteSwaps: {
    [Colors.DARK_GRAY]: Colors.DARK_GRAY,
    [Colors.LIGHT_GRAY]: Colors.LIGHT_GRAY
  },
  damage: 9,
  minLevel: 4,
  maxLevel: 6
};

const FIRE_SWORD: EquipmentClass = {
  name: 'Fire Sword',
  char: 'S',
  itemCategory: ItemCategory.WEAPON,
  equipmentCategory: EquipmentSlot.MELEE_WEAPON,
  mapIcon: SpriteFactory.MAP_SWORD,
  paletteSwaps: {
    [Colors.DARK_GRAY]: Colors.YELLOW,
    [Colors.LIGHT_GRAY]: Colors.RED,
    [Colors.BLACK]: Colors.DARK_RED
  },
  damage: 12,
  minLevel: 5,
  maxLevel: 6
};

const SHORT_BOW: EquipmentClass = {
  name: 'Short Bow',
  char: 'S',
  itemCategory: ItemCategory.WEAPON,
  equipmentCategory: EquipmentSlot.RANGED_WEAPON,
  mapIcon: SpriteFactory.MAP_BOW,
  paletteSwaps: {},
  damage: 4,
  minLevel: 2,
  maxLevel: 4
};

const LONG_BOW: EquipmentClass = {
  name: 'Long Bow',
  char: 'S',
  itemCategory: ItemCategory.WEAPON,
  equipmentCategory: EquipmentSlot.RANGED_WEAPON,
  mapIcon: SpriteFactory.MAP_BOW,
  paletteSwaps: {
    [Colors.DARK_GREEN]: Colors.DARK_RED,
    [Colors.GREEN]: Colors.RED,
  },
  damage: 6,
  minLevel: 5,
  maxLevel: 6
};

function getWeaponClasses() {
  return [BRONZE_SWORD, IRON_SWORD, STEEL_SWORD, FIRE_SWORD, SHORT_BOW, LONG_BOW];
}

export {
  EquipmentClass,
  getWeaponClasses
};