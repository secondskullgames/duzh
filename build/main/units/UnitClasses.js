"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var SpriteFactory_1 = require("../graphics/sprites/SpriteFactory");
var Colors_1 = require("../types/Colors");
var types_1 = require("../types/types");
var UnitAI_1 = require("./UnitAI");
var PLAYER = {
    name: 'PLAYER',
    type: types_1.UnitType.HUMAN,
    sprite: SpriteFactory_1.default.PLAYER,
    // Green/brown colors
    paletteSwaps: (_a = {},
        _a[Colors_1.default.DARK_PURPLE] = Colors_1.default.DARK_BROWN,
        _a[Colors_1.default.MAGENTA] = Colors_1.default.DARK_GREEN,
        _a[Colors_1.default.DARK_BLUE] = Colors_1.default.DARK_GREEN,
        _a[Colors_1.default.CYAN] = Colors_1.default.LIGHT_PINK,
        _a[Colors_1.default.BLACK] = Colors_1.default.BLACK,
        _a[Colors_1.default.DARK_GRAY] = Colors_1.default.DARK_BROWN,
        _a[Colors_1.default.LIGHT_GRAY] = Colors_1.default.LIGHT_BROWN,
        _a[Colors_1.default.DARK_GREEN] = Colors_1.default.DARK_BROWN,
        _a[Colors_1.default.GREEN] = Colors_1.default.DARK_BROWN,
        _a[Colors_1.default.ORANGE] = Colors_1.default.LIGHT_PINK // Face
    ,
        _a),
    startingLife: 100,
    startingMana: 100,
    startingDamage: 10,
    minLevel: 1,
    maxLevel: 20,
    lifePerLevel: function (level) { return 10; },
    manaPerLevel: function (level) { return 0; },
    damagePerLevel: function (level) { return 1; },
    experienceToNextLevel: function (currentLevel) { return (currentLevel < 10) ? 2 * currentLevel + 2 : null; },
};
var ENEMY_SNAKE = {
    name: 'ENEMY_SNAKE',
    type: types_1.UnitType.ANIMAL,
    sprite: SpriteFactory_1.default.SNAKE,
    paletteSwaps: {},
    startingLife: 40,
    startingMana: null,
    startingDamage: 4,
    minLevel: 1,
    maxLevel: 2,
    lifePerLevel: function () { return 15; },
    manaPerLevel: function () { return null; },
    damagePerLevel: function () { return 1; },
    aiHandler: UnitAI_1.HUMAN_DETERMINISTIC,
    aiParams: {
        speed: 0.95,
        visionRange: 10,
        fleeThreshold: 0.2
    }
};
var ENEMY_GRUNT = {
    name: 'ENEMY_GRUNT',
    type: types_1.UnitType.HUMAN,
    sprite: SpriteFactory_1.default.GRUNT,
    paletteSwaps: {},
    startingLife: 50,
    startingMana: null,
    startingDamage: 5,
    minLevel: 1,
    maxLevel: 4,
    lifePerLevel: function () { return 20; },
    manaPerLevel: function () { return null; },
    damagePerLevel: function () { return 1; },
    aiHandler: UnitAI_1.HUMAN_DETERMINISTIC,
    aiParams: {
        speed: 0.90,
        visionRange: 8,
        fleeThreshold: 0.1
    }
};
var ENEMY_SOLDIER = {
    name: 'ENEMY_SOLDIER',
    type: types_1.UnitType.HUMAN,
    sprite: SpriteFactory_1.default.SOLDIER,
    paletteSwaps: {},
    startingLife: 60,
    startingMana: null,
    startingDamage: 6,
    minLevel: 3,
    maxLevel: 6,
    lifePerLevel: function () { return 20; },
    manaPerLevel: function () { return null; },
    damagePerLevel: function () { return 2; },
    aiHandler: UnitAI_1.HUMAN_DETERMINISTIC,
    aiParams: {
        speed: 0.90,
        visionRange: 10,
        fleeThreshold: 0.1
    }
};
var ENEMY_GOLEM = {
    name: 'ENEMY_GOLEM',
    type: types_1.UnitType.GOLEM,
    sprite: SpriteFactory_1.default.GOLEM,
    paletteSwaps: (_b = {},
        _b[Colors_1.default.DARK_GRAY] = Colors_1.default.DARKER_GRAY,
        _b[Colors_1.default.LIGHT_GRAY] = Colors_1.default.DARKER_GRAY,
        _b),
    startingLife: 80,
    startingMana: null,
    startingDamage: 10,
    minLevel: 5,
    maxLevel: 9,
    lifePerLevel: function () { return 20; },
    manaPerLevel: function () { return null; },
    damagePerLevel: function () { return 2; },
    aiHandler: UnitAI_1.HUMAN_DETERMINISTIC,
    aiParams: {
        speed: 0.88,
        visionRange: 12,
        fleeThreshold: 0
    }
};
function getEnemyClasses() {
    return [ENEMY_SNAKE, ENEMY_GRUNT, ENEMY_SOLDIER, ENEMY_GOLEM];
}
exports.default = {
    PLAYER: PLAYER,
    ENEMY_GRUNT: ENEMY_GRUNT,
    ENEMY_GOLEM: ENEMY_GOLEM,
    getEnemyClasses: getEnemyClasses
};
//# sourceMappingURL=UnitClasses.js.map