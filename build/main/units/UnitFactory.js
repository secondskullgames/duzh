import UnitClasses from './UnitClasses.js';
import { randChoice } from '../utils/RandomUtils.js';
import Unit from './Unit.js';
function createRandomEnemy(_a, level) {
    var x = _a.x, y = _a.y;
    var candidates = UnitClasses.getEnemyClasses()
        .filter(function (unitClass) { return level >= unitClass.minLevel; })
        .filter(function (unitClass) { return level <= unitClass.maxLevel; });
    var unitClass = randChoice(candidates);
    return new Unit(unitClass, unitClass.name, level, { x: x, y: y });
}
export default {
    createRandomEnemy: createRandomEnemy
};
//# sourceMappingURL=UnitFactory.js.map