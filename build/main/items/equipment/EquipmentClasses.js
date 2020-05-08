var _a, _b, _c, _d, _e;
import { EquipmentSlot, ItemCategory } from '../../types/types.js';
import SpriteFactory from '../../graphics/sprites/SpriteFactory.js';
import Colors from '../../types/Colors.js';
var BRONZE_SWORD = {
    name: 'Bronze Sword',
    char: 'S',
    itemCategory: ItemCategory.WEAPON,
    equipmentCategory: EquipmentSlot.MELEE_WEAPON,
    mapIcon: SpriteFactory.MAP_SWORD,
    paletteSwaps: (_a = {},
        _a[Colors.BLACK] = Colors.BLACK,
        _a[Colors.DARK_GRAY] = Colors.LIGHT_BROWN,
        _a[Colors.LIGHT_GRAY] = Colors.LIGHT_BROWN,
        _a),
    damage: 2,
    minLevel: 1,
    maxLevel: 2
};
var IRON_SWORD = {
    name: 'Iron Sword',
    char: 'S',
    itemCategory: ItemCategory.WEAPON,
    equipmentCategory: EquipmentSlot.MELEE_WEAPON,
    mapIcon: SpriteFactory.MAP_SWORD,
    paletteSwaps: (_b = {},
        _b[Colors.DARK_GRAY] = Colors.BLACK,
        _b[Colors.LIGHT_GRAY] = Colors.DARK_GRAY,
        _b),
    damage: 4,
    minLevel: 3,
    maxLevel: 4
};
var STEEL_SWORD = {
    name: 'Steel Sword',
    char: 'S',
    itemCategory: ItemCategory.WEAPON,
    equipmentCategory: EquipmentSlot.MELEE_WEAPON,
    mapIcon: SpriteFactory.MAP_SWORD,
    paletteSwaps: (_c = {},
        _c[Colors.DARK_GRAY] = Colors.DARK_GRAY,
        _c[Colors.LIGHT_GRAY] = Colors.LIGHT_GRAY,
        _c),
    damage: 6,
    minLevel: 4,
    maxLevel: 6
};
var FIRE_SWORD = {
    name: 'Fire Sword',
    char: 'S',
    itemCategory: ItemCategory.WEAPON,
    equipmentCategory: EquipmentSlot.MELEE_WEAPON,
    mapIcon: SpriteFactory.MAP_SWORD,
    paletteSwaps: (_d = {},
        _d[Colors.DARK_GRAY] = Colors.YELLOW,
        _d[Colors.LIGHT_GRAY] = Colors.RED,
        _d[Colors.BLACK] = Colors.DARK_RED,
        _d),
    damage: 8,
    minLevel: 5,
    maxLevel: 6
};
var SHORT_BOW = {
    name: 'Short Bow',
    char: 'S',
    itemCategory: ItemCategory.WEAPON,
    equipmentCategory: EquipmentSlot.RANGED_WEAPON,
    mapIcon: SpriteFactory.MAP_BOW,
    paletteSwaps: {},
    damage: 2,
    minLevel: 2,
    maxLevel: 4
};
var LONG_BOW = {
    name: 'Long Bow',
    char: 'S',
    itemCategory: ItemCategory.WEAPON,
    equipmentCategory: EquipmentSlot.RANGED_WEAPON,
    mapIcon: SpriteFactory.MAP_BOW,
    paletteSwaps: (_e = {},
        _e[Colors.DARK_GREEN] = Colors.DARK_RED,
        _e[Colors.GREEN] = Colors.RED,
        _e),
    damage: 4,
    minLevel: 5,
    maxLevel: 6
};
function getWeaponClasses() {
    return [BRONZE_SWORD, IRON_SWORD, STEEL_SWORD, FIRE_SWORD, SHORT_BOW, LONG_BOW];
}
export { getWeaponClasses };
//# sourceMappingURL=EquipmentClasses.js.map