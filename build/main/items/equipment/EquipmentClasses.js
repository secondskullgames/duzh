"use strict";
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("../../types/types");
var SpriteFactory_1 = require("../../graphics/sprites/SpriteFactory");
var Colors_1 = require("../../types/Colors");
var BRONZE_SWORD = {
    name: 'Bronze Sword',
    char: 'S',
    itemCategory: types_1.ItemCategory.WEAPON,
    equipmentCategory: types_1.EquipmentSlot.MELEE_WEAPON,
    mapIcon: SpriteFactory_1.default.MAP_SWORD,
    paletteSwaps: (_a = {},
        _a[Colors_1.default.BLACK] = Colors_1.default.BLACK,
        _a[Colors_1.default.DARK_GRAY] = Colors_1.default.LIGHT_BROWN,
        _a[Colors_1.default.LIGHT_GRAY] = Colors_1.default.LIGHT_BROWN,
        _a),
    damage: 2,
    minLevel: 1,
    maxLevel: 2
};
var IRON_SWORD = {
    name: 'Iron Sword',
    char: 'S',
    itemCategory: types_1.ItemCategory.WEAPON,
    equipmentCategory: types_1.EquipmentSlot.MELEE_WEAPON,
    mapIcon: SpriteFactory_1.default.MAP_SWORD,
    paletteSwaps: (_b = {},
        _b[Colors_1.default.DARK_GRAY] = Colors_1.default.BLACK,
        _b[Colors_1.default.LIGHT_GRAY] = Colors_1.default.DARK_GRAY,
        _b),
    damage: 4,
    minLevel: 3,
    maxLevel: 4
};
var STEEL_SWORD = {
    name: 'Steel Sword',
    char: 'S',
    itemCategory: types_1.ItemCategory.WEAPON,
    equipmentCategory: types_1.EquipmentSlot.MELEE_WEAPON,
    mapIcon: SpriteFactory_1.default.MAP_SWORD,
    paletteSwaps: (_c = {},
        _c[Colors_1.default.DARK_GRAY] = Colors_1.default.DARK_GRAY,
        _c[Colors_1.default.LIGHT_GRAY] = Colors_1.default.LIGHT_GRAY,
        _c),
    damage: 6,
    minLevel: 4,
    maxLevel: 6
};
var FIRE_SWORD = {
    name: 'Fire Sword',
    char: 'S',
    itemCategory: types_1.ItemCategory.WEAPON,
    equipmentCategory: types_1.EquipmentSlot.MELEE_WEAPON,
    mapIcon: SpriteFactory_1.default.MAP_SWORD,
    paletteSwaps: (_d = {},
        _d[Colors_1.default.DARK_GRAY] = Colors_1.default.YELLOW,
        _d[Colors_1.default.LIGHT_GRAY] = Colors_1.default.RED,
        _d[Colors_1.default.BLACK] = Colors_1.default.DARK_RED,
        _d),
    damage: 8,
    minLevel: 5,
    maxLevel: 6
};
var SHORT_BOW = {
    name: 'Short Bow',
    char: 'S',
    itemCategory: types_1.ItemCategory.WEAPON,
    equipmentCategory: types_1.EquipmentSlot.RANGED_WEAPON,
    mapIcon: SpriteFactory_1.default.MAP_BOW,
    paletteSwaps: {},
    damage: 2,
    minLevel: 2,
    maxLevel: 4
};
var LONG_BOW = {
    name: 'Long Bow',
    char: 'S',
    itemCategory: types_1.ItemCategory.WEAPON,
    equipmentCategory: types_1.EquipmentSlot.RANGED_WEAPON,
    mapIcon: SpriteFactory_1.default.MAP_BOW,
    paletteSwaps: (_e = {},
        _e[Colors_1.default.DARK_GREEN] = Colors_1.default.DARK_RED,
        _e[Colors_1.default.GREEN] = Colors_1.default.RED,
        _e),
    damage: 4,
    minLevel: 5,
    maxLevel: 6
};
function getWeaponClasses() {
    return [BRONZE_SWORD, IRON_SWORD, STEEL_SWORD, FIRE_SWORD, SHORT_BOW, LONG_BOW];
}
exports.getWeaponClasses = getWeaponClasses;
//# sourceMappingURL=EquipmentClasses.js.map