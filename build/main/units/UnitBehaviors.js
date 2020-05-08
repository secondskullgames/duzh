import Pathfinder from '../utils/Pathfinder.js';
import { randChoice } from '../utils/RandomUtils.js';
import { moveOrAttack } from './UnitUtils.js';
import { resolvedPromise } from '../utils/PromiseUtils.js';
import { comparingReversed } from '../utils/ArrayUtils.js';
import { coordinatesEquals, manhattanDistance } from '../maps/MapUtils.js';
import Directions from '../types/Directions.js';
function _wanderAndAttack(unit) {
    var playerUnit = jwb.state.playerUnit;
    var map = jwb.state.getMap();
    var tiles = [];
    Directions.values().forEach(function (_a) {
        var dx = _a.dx, dy = _a.dy;
        var _b = [unit.x + dx, unit.y + dy], x = _b[0], y = _b[1];
        if (map.contains({ x: x, y: y })) {
            if (!map.isBlocked({ x: x, y: y })) {
                tiles.push({ x: x, y: y });
            }
            else if (map.getUnit({ x: x, y: y })) {
                if (map.getUnit({ x: x, y: y }) === playerUnit) {
                    tiles.push({ x: x, y: y });
                }
            }
        }
    });
    if (tiles.length > 0) {
        var _a = randChoice(tiles), x = _a.x, y = _a.y;
        return moveOrAttack(unit, { x: x, y: y });
    }
    return resolvedPromise();
}
function _wander(unit) {
    var map = jwb.state.getMap();
    var tiles = [];
    Directions.values().forEach(function (_a) {
        var dx = _a.dx, dy = _a.dy;
        var _b = [unit.x + dx, unit.y + dy], x = _b[0], y = _b[1];
        if (map.contains({ x: x, y: y })) {
            if (!map.isBlocked({ x: x, y: y })) {
                tiles.push({ x: x, y: y });
            }
        }
    });
    if (tiles.length > 0) {
        var _a = randChoice(tiles), x = _a.x, y = _a.y;
        return moveOrAttack(unit, { x: x, y: y });
    }
    return resolvedPromise();
}
function _attackPlayerUnit_withPath(unit) {
    var playerUnit = jwb.state.playerUnit;
    var map = jwb.state.getMap();
    var mapRect = map.getRect();
    var unblockedTiles = [];
    for (var y = 0; y < mapRect.height; y++) {
        for (var x = 0; x < mapRect.width; x++) {
            if (!map.getTile({ x: x, y: y }).isBlocking) {
                unblockedTiles.push({ x: x, y: y });
            }
            else if (coordinatesEquals({ x: x, y: y }, playerUnit)) {
                unblockedTiles.push({ x: x, y: y });
            }
            else {
                // blocked
            }
        }
    }
    var path = new Pathfinder(function () { return 1; }).findPath(unit, playerUnit, unblockedTiles);
    if (path.length > 1) {
        var _a = path[1], x = _a.x, y = _a.y; // first tile is the unit's own tile
        var unitAtPoint = map.getUnit({ x: x, y: y });
        if (!unitAtPoint || unitAtPoint === playerUnit) {
            return moveOrAttack(unit, { x: x, y: y });
        }
    }
    return resolvedPromise();
}
function _fleeFromPlayerUnit(unit) {
    var playerUnit = jwb.state.playerUnit;
    var map = jwb.state.getMap();
    var tiles = [];
    Directions.values().forEach(function (_a) {
        var dx = _a.dx, dy = _a.dy;
        var _b = [unit.x + dx, unit.y + dy], x = _b[0], y = _b[1];
        if (map.contains({ x: x, y: y })) {
            if (!map.isBlocked({ x: x, y: y })) {
                tiles.push({ x: x, y: y });
            }
            else if (map.getUnit({ x: x, y: y })) {
                if (map.getUnit({ x: x, y: y }) === playerUnit) {
                    tiles.push({ x: x, y: y });
                }
            }
        }
    });
    if (tiles.length > 0) {
        var orderedTiles = tiles.sort(comparingReversed(function (coordinates) { return manhattanDistance(coordinates, playerUnit); }));
        var _a = orderedTiles[0], x = _a.x, y = _a.y;
        return moveOrAttack(unit, { x: x, y: y });
    }
    return resolvedPromise();
}
var UnitBehaviors = {
    WANDER: _wander,
    ATTACK_PLAYER: _attackPlayerUnit_withPath,
    FLEE_FROM_PLAYER: _fleeFromPlayerUnit,
    STAY: function () { return resolvedPromise(); }
};
export default UnitBehaviors;
//# sourceMappingURL=UnitBehaviors.js.map