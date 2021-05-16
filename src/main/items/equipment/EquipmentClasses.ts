import { EquipmentSlot, ItemCategory, PaletteSwaps } from '../../types/types';
import Colors from '../../types/Colors';

interface EquipmentClass {
  name: string,
  sprite: string,
  mapIcon: string,
  itemCategory: ItemCategory,
  slot: EquipmentSlot,
  char: string,
  paletteSwaps: PaletteSwaps,
  minLevel: number,
  maxLevel: number,
  damage?: number
}

const BRONZE_SWORD: EquipmentClass = {
  name: 'Bronze Sword',
  sprite: 'sword',
  mapIcon: 'map_sword',
  char: 'S',
  itemCategory: ItemCategory.WEAPON,
  slot: EquipmentSlot.MELEE_WEAPON,
  paletteSwaps: {
    [Colors.BLACK]: Colors.BLACK,
    [Colors.DARK_GRAY]: Colors.LIGHT_BROWN,
    [Colors.LIGHT_GRAY]: Colors.LIGHT_BROWN
  },
  damage: 2,
  minLevel: 1,
  maxLevel: 2
};

const IRON_SWORD: EquipmentClass = {
  name: 'Iron Sword',
  sprite: 'sword',
  mapIcon: 'map_sword',
  char: 'S',
  itemCategory: ItemCategory.WEAPON,
  slot: EquipmentSlot.MELEE_WEAPON,
  paletteSwaps: {
    [Colors.DARK_GRAY]: Colors.BLACK,
    [Colors.LIGHT_GRAY]: Colors.DARK_GRAY
  },
  damage: 4,
  minLevel: 3,
  maxLevel: 4
};

const STEEL_SWORD: EquipmentClass = {
  name: 'Steel Sword',
  sprite: 'sword',
  mapIcon: 'map_sword',
  char: 'S',
  itemCategory: ItemCategory.WEAPON,
  slot: EquipmentSlot.MELEE_WEAPON,
  paletteSwaps: {
    [Colors.DARK_GRAY]: Colors.DARK_GRAY,
    [Colors.LIGHT_GRAY]: Colors.LIGHT_GRAY
  },
  damage: 6,
  minLevel: 4,
  maxLevel: 6
};

const FIRE_SWORD: EquipmentClass = {
  name: 'Fire Sword',
  sprite: 'sword',
  mapIcon: 'map_sword',
  char: 'S',
  itemCategory: ItemCategory.WEAPON,
  slot: EquipmentSlot.MELEE_WEAPON,
  paletteSwaps: {
    [Colors.DARK_GRAY]: Colors.YELLOW,
    [Colors.LIGHT_GRAY]: Colors.RED,
    [Colors.BLACK]: Colors.DARK_RED
  },
  damage: 8,
  minLevel: 5,
  maxLevel: 6
};

const SHORT_BOW: EquipmentClass = {
  name: 'Short Bow',
  sprite: 'bow',
  mapIcon: 'map_bow',
  char: 'S',
  itemCategory: ItemCategory.WEAPON,
  slot: EquipmentSlot.RANGED_WEAPON,
  paletteSwaps: {},
  damage: 2,
  minLevel: 2,
  maxLevel: 4
};

const LONG_BOW: EquipmentClass = {
  name: 'Long Bow',
  sprite: 'bow',
  mapIcon: 'map_bow',
  char: 'S',
  itemCategory: ItemCategory.WEAPON,
  slot: EquipmentSlot.RANGED_WEAPON,
  paletteSwaps: {
    [Colors.DARK_GREEN]: Colors.DARK_RED,
    [Colors.GREEN]: Colors.RED,
  },
  damage: 4,
  minLevel: 5,
  maxLevel: 6
};

const BRONZE_CHAIN_MAIL: EquipmentClass = {
  name: 'Bronze Chain Mail',
  sprite: 'mail',
  mapIcon: 'map_mail',
  char: 'S',
  itemCategory: ItemCategory.ARMOR,
  slot: EquipmentSlot.CHEST,
  paletteSwaps: {
    [Colors.DARK_GRAY]: Colors.DARK_BROWN
  },
  minLevel: 1,
  maxLevel: 2
};

const IRON_CHAIN_MAIL: EquipmentClass = {
  name: 'Iron Chain Mail',
  sprite: 'mail',
  mapIcon: 'map_mail',
  char: 'S',
  itemCategory: ItemCategory.ARMOR,
  slot: EquipmentSlot.CHEST,
  paletteSwaps: {},
  minLevel: 3,
  maxLevel: 6
};

const IRON_HELMET: EquipmentClass = {
  name: 'Iron Helmet',
  sprite: 'helmet',
  mapIcon: 'map_helmet',
  char: 'S',
  itemCategory: ItemCategory.ARMOR,
  slot: EquipmentSlot.HEAD,
  paletteSwaps: {},
  minLevel: 1,
  maxLevel: 6
};

const EquipmentClasses: { [name: string]: EquipmentClass } = {
  BRONZE_SWORD,
  IRON_SWORD,
  STEEL_SWORD,
  FIRE_SWORD,
  SHORT_BOW,
  LONG_BOW,
  BRONZE_CHAIN_MAIL,
  IRON_CHAIN_MAIL,
  IRON_HELMET
}

export {
  EquipmentClass,
  EquipmentClasses
};