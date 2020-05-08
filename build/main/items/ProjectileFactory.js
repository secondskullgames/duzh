import SpriteFactory from '../graphics/sprites/SpriteFactory.js';
function createArrow(_a, direction) {
    var x = _a.x, y = _a.y;
    return {
        x: x,
        y: y,
        direction: direction,
        sprite: SpriteFactory.ARROW(direction, {}),
        char: 'x'
    };
}
export { createArrow };
//# sourceMappingURL=ProjectileFactory.js.map