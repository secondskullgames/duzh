"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var ProjectileSprite_1 = require("./ProjectileSprite");
var ArrowSprite = /** @class */ (function (_super) {
    __extends(ArrowSprite, _super);
    function ArrowSprite(direction, paletteSwaps) {
        return _super.call(this, direction, 'arrow', paletteSwaps, { dx: 0, dy: -8 }) || this;
    }
    return ArrowSprite;
}(ProjectileSprite_1.default));
exports.default = ArrowSprite;
//# sourceMappingURL=ArrowSprite.js.map