"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UnitClasses_1 = require("./UnitClasses");
var RandomUtils_1 = require("../utils/RandomUtils");
var Unit_1 = require("./Unit");
function createRandomEnemy(_a, level) {
    var x = _a.x, y = _a.y;
    var candidates = UnitClasses_1.default.getEnemyClasses()
        .filter(function (unitClass) { return level >= unitClass.minLevel; })
        .filter(function (unitClass) { return level <= unitClass.maxLevel; });
    var unitClass = RandomUtils_1.randChoice(candidates);
    return new Unit_1.default(unitClass, unitClass.name, level, { x: x, y: y });
}
exports.default = {
    createRandomEnemy: createRandomEnemy
};
//# sourceMappingURL=UnitFactory.js.map