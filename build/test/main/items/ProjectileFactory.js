"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SpriteFactory_1 = require("../graphics/sprites/SpriteFactory");
function createArrow(_a, direction) {
    var x = _a.x, y = _a.y;
    return {
        x: x,
        y: y,
        direction: direction,
        sprite: SpriteFactory_1.default.ARROW(direction, {}),
        char: 'x'
    };
}
exports.createArrow = createArrow;
//# sourceMappingURL=ProjectileFactory.js.map