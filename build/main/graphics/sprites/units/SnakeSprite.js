var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import UnitSprite from './UnitSprite.js';
var SnakeSprite = /** @class */ (function (_super) {
    __extends(SnakeSprite, _super);
    function SnakeSprite(unit, paletteSwaps) {
        return _super.call(this, unit, 'snake', paletteSwaps, { dx: 0, dy: 0 }) || this;
    }
    return SnakeSprite;
}(UnitSprite));
export default SnakeSprite;
//# sourceMappingURL=SnakeSprite.js.map