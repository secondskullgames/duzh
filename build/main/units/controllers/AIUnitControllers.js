"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UnitBehaviors_1 = require("../UnitBehaviors");
var MapUtils_1 = require("../../maps/MapUtils");
var RandomUtils_1 = require("../../utils/RandomUtils");
var behaviorMap = {
    'ATTACK_PLAYER': UnitBehaviors_1.default.ATTACK_PLAYER,
    'WANDER': UnitBehaviors_1.default.WANDER,
    'FLEE_FROM_PLAYER': UnitBehaviors_1.default.FLEE_FROM_PLAYER,
    'STAY': UnitBehaviors_1.default.STAY
};
var HUMAN_CAUTIOUS = {
    issueOrder: function (unit) {
        var playerUnit = jwb.state.playerUnit;
        var behavior;
        var distanceToPlayer = MapUtils_1.manhattanDistance(unit, playerUnit);
        if (distanceToPlayer === 1) {
            if ((unit.life / unit.maxLife) >= 0.4) {
                behavior = UnitBehaviors_1.default.ATTACK_PLAYER;
            }
            else {
                behavior = RandomUtils_1.weightedRandom({
                    'ATTACK_PLAYER': 0.2,
                    'WANDER': 0.5,
                    'FLEE_FROM_PLAYER': 0.3
                }, behaviorMap);
            }
        }
        else if (distanceToPlayer >= 5) {
            behavior = RandomUtils_1.weightedRandom({
                'WANDER': 0.3,
                'ATTACK_PLAYER': 0.1,
                'STAY': 0.6
            }, behaviorMap);
        }
        else {
            behavior = RandomUtils_1.weightedRandom({
                'ATTACK_PLAYER': 0.6,
                'WANDER': 0.2,
                'STAY': 0.2
            }, behaviorMap);
        }
        return behavior(unit);
    }
};
exports.HUMAN_CAUTIOUS = HUMAN_CAUTIOUS;
var HUMAN_AGGRESSIVE = {
    issueOrder: function (unit) {
        var playerUnit = jwb.state.playerUnit;
        var behavior;
        var distanceToPlayer = MapUtils_1.manhattanDistance(unit, playerUnit);
        if (distanceToPlayer === 1) {
            behavior = UnitBehaviors_1.default.ATTACK_PLAYER;
        }
        else if (distanceToPlayer >= 6) {
            behavior = RandomUtils_1.weightedRandom({
                'WANDER': 0.4,
                'STAY': 0.4,
                'ATTACK_PLAYER': 0.2
            }, behaviorMap);
        }
        else {
            behavior = RandomUtils_1.weightedRandom({
                'ATTACK_PLAYER': 0.9,
                'STAY': 0.1
            }, behaviorMap);
        }
        return behavior(unit);
    }
};
exports.HUMAN_AGGRESSIVE = HUMAN_AGGRESSIVE;
var HUMAN_DETERMINISTIC = {
    issueOrder: function (unit) {
        var _a = jwb.state, playerUnit = _a.playerUnit, turn = _a.turn;
        var aiParams = unit.unitClass.aiParams;
        if (!aiParams) {
            throw 'HUMAN_DETERMINISTIC behavior requires aiParams!';
        }
        var speed = aiParams.speed, visionRange = aiParams.visionRange, fleeThreshold = aiParams.fleeThreshold;
        var behavior;
        var distanceToPlayer = MapUtils_1.manhattanDistance(unit, playerUnit);
        if (!_canMove(speed)) {
            behavior = UnitBehaviors_1.default.STAY;
        }
        else if ((unit.life / unit.maxLife) < fleeThreshold) {
            behavior = UnitBehaviors_1.default.FLEE_FROM_PLAYER;
        }
        else if (distanceToPlayer <= visionRange) {
            behavior = UnitBehaviors_1.default.ATTACK_PLAYER;
        }
        else {
            if (RandomUtils_1.randInt(0, 1) === 1) {
                behavior = UnitBehaviors_1.default.STAY;
            }
            else {
                behavior = UnitBehaviors_1.default.WANDER;
            }
        }
        return behavior(unit);
    }
};
exports.HUMAN_DETERMINISTIC = HUMAN_DETERMINISTIC;
function _canMove(speed) {
    // deterministic version
    // const { turn } = jwb.state;
    // return Math.floor(speed * turn) > Math.floor(speed * (turn - 1));
    // random version
    return Math.random() < speed;
}
//# sourceMappingURL=AIUnitControllers.js.map