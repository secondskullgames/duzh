import { EquipmentSlot, ItemCategory, PaletteSwaps, SpriteSupplier } from '../../types/types';
import Colors from '../../types/Colors';
import SpriteFactory, { EquipmentSpriteSupplier } from '../../graphics/sprites/SpriteFactory';

interface EquipmentClass {
  name: string,
  sprite: EquipmentSpriteSupplier,
  mapIcon: SpriteSupplier,
  itemCategory: ItemCategory,
  slot: EquipmentSlot,
  char: string,
  paletteSwaps: PaletteSwaps
  minLevel: number,
  maxLevel: number,
  damage?: number
}

const BRONZE_SWORD: EquipmentClass = {
  name: 'Bronze Sword',
  sprite: SpriteFactory.SWORD,
  mapIcon: SpriteFactory.MAP_SWORD,
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
  sprite: SpriteFactory.SWORD,
  mapIcon: SpriteFactory.MAP_SWORD,
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
  sprite: SpriteFactory.SWORD,
  mapIcon: SpriteFactory.MAP_SWORD,
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
  sprite: SpriteFactory.SWORD,
  mapIcon: SpriteFactory.MAP_SWORD,
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
  sprite: SpriteFactory.BOW,
  mapIcon: SpriteFactory.MAP_BOW,
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
  sprite: SpriteFactory.BOW,
  mapIcon: SpriteFactory.MAP_BOW,
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

const CHAIN_MAIL: EquipmentClass = {
  name: 'Chain Mail',
  sprite: SpriteFactory.MAIL,
  mapIcon: SpriteFactory.MAP_MAIL,
  char: 'S',
  itemCategory: ItemCategory.ARMOR,
  slot: EquipmentSlot.ARMOR,
  paletteSwaps: {
  },
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
  CHAIN_MAIL
}

export {
  EquipmentClass,
  EquipmentClasses
};