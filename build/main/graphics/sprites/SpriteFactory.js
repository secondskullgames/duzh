import ImageSupplier from '../ImageSupplier.js';
import Sprite from './Sprite.js';
import Colors from '../../types/Colors.js';
import PlayerSprite from './units/PlayerSprite.js';
import GolemSprite from './units/GolemSprite.js';
import GruntSprite from './units/GruntSprite.js';
import SnakeSprite from './units/SnakeSprite.js';
import SoldierSprite from './units/SoldierSprite.js';
import ArrowSprite from './projectiles/ArrowSprite.js';
var DEFAULT_SPRITE_KEY = 'default';
function createStaticSprite(imageLoader, _a) {
    var _b;
    var dx = _a.dx, dy = _a.dy;
    return new Sprite((_b = {}, _b[DEFAULT_SPRITE_KEY] = imageLoader, _b), DEFAULT_SPRITE_KEY, { dx: dx, dy: dy });
}
var StaticSprites = {
    MAP_SWORD: function (paletteSwaps) { return createStaticSprite(new ImageSupplier('sword_icon', Colors.WHITE, paletteSwaps), { dx: 0, dy: -8 }); },
    MAP_POTION: function (paletteSwaps) { return createStaticSprite(new ImageSupplier('potion_icon', Colors.WHITE, paletteSwaps), { dx: 0, dy: -8 }); },
    MAP_SCROLL: function (paletteSwaps) { return createStaticSprite(new ImageSupplier('scroll_icon', Colors.WHITE, paletteSwaps), { dx: 0, dy: 0 }); },
    MAP_BOW: function (paletteSwaps) { return createStaticSprite(new ImageSupplier('bow_icon', Colors.WHITE, paletteSwaps), { dx: 0, dy: 0 }); }
};
var UnitSprites = {
    PLAYER: function (unit, paletteSwaps) { return new PlayerSprite(unit, paletteSwaps); },
    GOLEM: function (unit, paletteSwaps) { return new GolemSprite(unit, paletteSwaps); },
    GRUNT: function (unit, paletteSwaps) { return new GruntSprite(unit, paletteSwaps); },
    SNAKE: function (unit, paletteSwaps) { return new SnakeSprite(unit, paletteSwaps); },
    SOLDIER: function (unit, paletteSwaps) { return new SoldierSprite(unit, paletteSwaps); }
};
var ProjectileSprites = {
    ARROW: function (direction, paletteSwaps) { return new ArrowSprite(direction, paletteSwaps); }
};
// the following does not work: { ...StaticSprites, ...UnitSprites }
// :(
export default {
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
export { createStaticSprite };
//# sourceMappingURL=SpriteFactory.js.map