"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Sounds_1 = require("../sounds/Sounds");
var InventoryItem_1 = require("./InventoryItem");
var MapItem_1 = require("./MapItem");
var SpriteFactory_1 = require("../graphics/sprites/SpriteFactory");
var PromiseUtils_1 = require("../utils/PromiseUtils");
var RandomUtils_1 = require("../utils/RandomUtils");
var EquipmentClasses_1 = require("./equipment/EquipmentClasses");
var types_1 = require("../types/types");
var SoundFX_1 = require("../sounds/SoundFX");
var Animations_1 = require("../graphics/animations/Animations");
function createPotion(lifeRestored) {
    var onUse = function (item, unit) {
        return new Promise(function (resolve) {
            SoundFX_1.playSound(Sounds_1.default.USE_POTION);
            var prevLife = unit.life;
            unit.life = Math.min(unit.life + lifeRestored, unit.maxLife);
            jwb.state.messages.push(unit.name + " used " + item.name);
            jwb.state.messages.push("and gained " + (unit.life - prevLife) + " life.");
            resolve();
        });
    };
    return new InventoryItem_1.default('Potion', types_1.ItemCategory.POTION, onUse);
}
function _equipEquipment(equipmentClass, item, unit) {
    return new Promise(function (resolve) {
        var equippedItem = {
            name: equipmentClass.name,
            slot: equipmentClass.equipmentCategory,
            inventoryItem: item,
            damage: equipmentClass.damage
        };
        unit.equipment.add(equippedItem);
        resolve();
    });
}
function createScrollOfFloorFire(damage) {
    var onUse = function (item, unit) {
        var map = jwb.state.getMap();
        var promises = [];
        var adjacentUnits = map.units.filter(function (u) {
            var dx = unit.x - u.x;
            var dy = unit.y - u.y;
            return ([-1, 0, 1].indexOf(dx) > -1)
                && ([-1, 0, 1].indexOf(dy) > -1)
                && !(dx === 0 && dy === 0);
        });
        promises.push(function () { return Animations_1.playFloorFireAnimation(unit, adjacentUnits); });
        adjacentUnits.forEach(function (u) {
            promises.push(function () { return u.takeDamage(damage, unit); });
        });
        return PromiseUtils_1.chainPromises(promises);
    };
    return new InventoryItem_1.default('Scroll of Floor Fire', types_1.ItemCategory.SCROLL, onUse);
}
function _createInventoryWeapon(weaponClass) {
    var onUse = function (item, unit) { return _equipEquipment(weaponClass, item, unit); };
    return new InventoryItem_1.default(weaponClass.name, weaponClass.itemCategory, onUse);
}
function _createMapEquipment(equipmentClass, _a) {
    var x = _a.x, y = _a.y;
    var sprite = equipmentClass.mapIcon(equipmentClass.paletteSwaps);
    var inventoryItem = _createInventoryWeapon(equipmentClass);
    return new MapItem_1.default({ x: x, y: y }, equipmentClass.char, sprite, inventoryItem);
}
function _getItemSuppliers(level) {
    var createMapPotion = function (_a) {
        var x = _a.x, y = _a.y;
        var sprite = SpriteFactory_1.default.MAP_POTION();
        var inventoryItem = createPotion(40);
        return new MapItem_1.default({ x: x, y: y }, 'K', sprite, inventoryItem);
    };
    var createFloorFireScroll = function (_a) {
        var x = _a.x, y = _a.y;
        var sprite = SpriteFactory_1.default.MAP_SCROLL();
        var inventoryItem = createScrollOfFloorFire(80);
        return new MapItem_1.default({ x: x, y: y }, 'K', sprite, inventoryItem);
    };
    return [createMapPotion, createFloorFireScroll];
}
function _getWeaponSuppliers(level) {
    return EquipmentClasses_1.getWeaponClasses()
        .filter(function (weaponClass) { return level >= weaponClass.minLevel; })
        .filter(function (weaponClass) { return level <= weaponClass.maxLevel; })
        .map(function (weaponClass) { return function (_a) {
        var x = _a.x, y = _a.y;
        return _createMapEquipment(weaponClass, { x: x, y: y });
    }; });
}
function createRandomItem(_a, level) {
    var x = _a.x, y = _a.y;
    var suppliers = __spreadArrays(_getItemSuppliers(level), _getWeaponSuppliers(level));
    return RandomUtils_1.randChoice(suppliers)({ x: x, y: y });
}
exports.default = {
    createRandomItem: createRandomItem
};
//# sourceMappingURL=ItemFactory.js.map