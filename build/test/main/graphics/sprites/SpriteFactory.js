"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ImageSupplier_1 = require("../ImageSupplier");
var Sprite_1 = require("./Sprite");
var Colors_1 = require("../../types/Colors");
var PlayerSprite_1 = require("./units/PlayerSprite");
var GolemSprite_1 = require("./units/GolemSprite");
var GruntSprite_1 = require("./units/GruntSprite");
var SnakeSprite_1 = require("./units/SnakeSprite");
var SoldierSprite_1 = require("./units/SoldierSprite");
var ArrowSprite_1 = require("./projectiles/ArrowSprite");
var DEFAULT_SPRITE_KEY = 'default';
function createStaticSprite(imageLoader, _a) {
    var _b;
    var dx = _a.dx, dy = _a.dy;
    return new Sprite_1.default((_b = {}, _b[DEFAULT_SPRITE_KEY] = imageLoader, _b), DEFAULT_SPRITE_KEY, { dx: dx, dy: dy });
}
exports.createStaticSprite = createStaticSprite;
var StaticSprites = {
    MAP_SWORD: function (paletteSwaps) { return createStaticSprite(new ImageSupplier_1.default('sword_icon', Colors_1.default.WHITE, paletteSwaps), { dx: 0, dy: -8 }); },
    MAP_POTION: function (paletteSwaps) { return createStaticSprite(new ImageSupplier_1.default('potion_icon', Colors_1.default.WHITE, paletteSwaps), { dx: 0, dy: -8 }); },
    MAP_SCROLL: function (paletteSwaps) { return createStaticSprite(new ImageSupplier_1.default('scroll_icon', Colors_1.default.WHITE, paletteSwaps), { dx: 0, dy: 0 }); },
    MAP_BOW: function (paletteSwaps) { return createStaticSprite(new ImageSupplier_1.default('bow_icon', Colors_1.default.WHITE, paletteSwaps), { dx: 0, dy: 0 }); }
};
var UnitSprites = {
    PLAYER: function (unit, paletteSwaps) { return new PlayerSprite_1.default(unit, paletteSwaps); },
    GOLEM: function (unit, paletteSwaps) { return new GolemSprite_1.default(unit, paletteSwaps); },
    GRUNT: function (unit, paletteSwaps) { return new GruntSprite_1.default(unit, paletteSwaps); },
    SNAKE: function (unit, paletteSwaps) { return new SnakeSprite_1.default(unit, paletteSwaps); },
    SOLDIER: function (unit, paletteSwaps) { return new SoldierSprite_1.default(unit, paletteSwaps); }
};
var ProjectileSprites = {
    ARROW: function (direction, paletteSwaps) { return new ArrowSprite_1.default(direction, paletteSwaps); }
};
// the following does not work: { ...StaticSprites, ...UnitSprites }
// :(
exports.default = {
    MAP_SWORD: StaticSprites.MAP_SWORD,
    MAP_POTION: StaticSprites.MAP_POTION,
    MAP_SCROLL: StaticSprites.MAP_SCROLL,
    MAP_BOW: StaticSprites.MAP_BOW,
    PLAYER: UnitSprites.PLAYER,
    GOLEM: UnitSprites.GOLEM,
    GRUNT: UnitSprites.GRUNT,
    SNAKE: UnitSprites.SNAKE,
    SOLDIER: UnitSprites.SOLDIER,
    ARROW: ProjectileSprites.ARROW
};
//# sourceMappingURL=SpriteFactory.js.map