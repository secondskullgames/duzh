var _a, _b;
import SpriteFactory from '../graphics/sprites/SpriteFactory.js';
import Colors from '../types/Colors.js';
import { UnitType } from '../types/types.js';
import { HUMAN_DETERMINISTIC } from './UnitAI.js';
var PLAYER = {
    name: 'PLAYER',
    type: UnitType.HUMAN,
    sprite: SpriteFactory.PLAYER,
    // Green/brown colors
    paletteSwaps: (_a = {},
        _a[Colors.DARK_PURPLE] = Colors.DARK_BROWN,
        _a[Colors.MAGENTA] = Colors.DARK_GREEN,
        _a[Colors.DARK_BLUE] = Colors.DARK_GREEN,
        _a[Colors.CYAN] = Colors.LIGHT_PINK,
        _a[Colors.BLACK] = Colors.BLACK,
        _a[Colors.DARK_GRAY] = Colors.DARK_BROWN,
        _a[Colors.LIGHT_GRAY] = Colors.LIGHT_BROWN,
        _a[Colors.DARK_GREEN] = Colors.DARK_BROWN,
        _a[Colors.GREEN] = Colors.DARK_BROWN,
        _a[Colors.ORANGE] = Colors.LIGHT_PINK // Face
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
    type: UnitType.ANIMAL,
    sprite: SpriteFactory.SNAKE,
    paletteSwaps: {},
    startingLife: 40,
    startingMana: null,
    startingDamage: 4,
    minLevel: 1,
    maxLevel: 2,
    lifePerLevel: function () { return 15; },
    manaPerLevel: function () { return null; },
    damagePerLevel: function () { return 1; },
    aiHandler: HUMAN_DETERMINISTIC,
    aiParams: {
        speed: 0.95,
        visionRange: 10,
        fleeThreshold: 0.2
    }
};
var ENEMY_GRUNT = {
    name: 'ENEMY_GRUNT',
    type: UnitType.HUMAN,
    sprite: SpriteFactory.GRUNT,
    paletteSwaps: {},
    startingLife: 50,
    startingMana: null,
    startingDamage: 5,
    minLevel: 1,
    maxLevel: 4,
    lifePerLevel: function () { return 20; },
    manaPerLevel: function () { return null; },
    damagePerLevel: function () { return 1; },
    aiHandler: HUMAN_DETERMINISTIC,
    aiParams: {
        speed: 0.90,
        visionRange: 8,
        fleeThreshold: 0.1
    }
};
var ENEMY_SOLDIER = {
    name: 'ENEMY_SOLDIER',
    type: UnitType.HUMAN,
    sprite: SpriteFactory.SOLDIER,
    paletteSwaps: {},
    startingLife: 60,
    startingMana: null,
    startingDamage: 6,
    minLevel: 3,
    maxLevel: 6,
    lifePerLevel: function () { return 20; },
    manaPerLevel: function () { return null; },
    damagePerLevel: function () { return 2; },
    aiHandler: HUMAN_DETERMINISTIC,
    aiParams: {
        speed: 0.90,
        visionRange: 10,
        fleeThreshold: 0.1
    }
};
var ENEMY_GOLEM = {
    name: 'ENEMY_GOLEM',
    type: UnitType.GOLEM,
    sprite: SpriteFactory.GOLEM,
    paletteSwaps: (_b = {},
        _b[Colors.DARK_GRAY] = Colors.DARKER_GRAY,
        _b[Colors.LIGHT_GRAY] = Colors.DARKER_GRAY,
        _b),
    startingLife: 80,
    startingMana: null,
    startingDamage: 10,
    minLevel: 5,
    maxLevel: 9,
    lifePerLevel: function () { return 20; },
    manaPerLevel: function () { return null; },
    damagePerLevel: function () { return 2; },
    aiHandler: HUMAN_DETERMINISTIC,
    aiParams: {
        speed: 0.88,
        visionRange: 12,
        fleeThreshold: 0
    }
};
function getEnemyClasses() {
    return [ENEMY_SNAKE, ENEMY_GRUNT, ENEMY_SOLDIER, ENEMY_GOLEM];
}
export default {
    PLAYER: PLAYER,
    ENEMY_GRUNT: ENEMY_GRUNT,
    ENEMY_GOLEM: ENEMY_GOLEM,
    getEnemyClasses: getEnemyClasses
};
//# sourceMappingURL=UnitClasses.js.map