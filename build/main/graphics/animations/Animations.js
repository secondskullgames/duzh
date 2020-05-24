"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("../../types/types");
var PromiseUtils_1 = require("../../utils/PromiseUtils");
var ProjectileFactory_1 = require("../../items/ProjectileFactory");
var FRAME_LENGTH = 150; // milliseconds
function playAttackingAnimation(source, target) {
    return _playAnimation({
        frames: [
            {
                units: [
                    { unit: source, activity: types_1.Activity.ATTACKING },
                    { unit: target, activity: types_1.Activity.DAMAGED }
                ],
            },
            {
                units: [
                    { unit: source, activity: types_1.Activity.STANDING },
                    { unit: target, activity: types_1.Activity.STANDING }
                ]
            }
        ],
        delay: FRAME_LENGTH
    });
}
exports.playAttackingAnimation = playAttackingAnimation;
function playArrowAnimation(source, direction, coordinatesList, target) {
    var frames = [];
    // first frame
    {
        var frame = {
            units: [
                { unit: source, activity: types_1.Activity.ATTACKING }
            ]
        };
        if (target) {
            frame.units.push({ unit: target, activity: types_1.Activity.STANDING });
        }
        frames.push(frame);
    }
    // arrow movement frames
    coordinatesList.forEach(function (_a) {
        var x = _a.x, y = _a.y;
        var projectile = ProjectileFactory_1.createArrow({ x: x, y: y }, direction);
        var frame = {
            units: [{ unit: source, activity: types_1.Activity.ATTACKING }],
            projectiles: [projectile]
        };
        if (target) {
            frame.units.push({ unit: target, activity: types_1.Activity.STANDING });
        }
        frames.push(frame);
    });
    // last frames
    {
        var frame = {
            units: [
                { unit: source, activity: types_1.Activity.STANDING }
            ]
        };
        if (target) {
            frame.units.push({ unit: target, activity: types_1.Activity.DAMAGED });
        }
        frames.push(frame);
    }
    {
        var frame = {
            units: [
                { unit: source, activity: types_1.Activity.STANDING }
            ]
        };
        if (target) {
            frame.units.push({ unit: target, activity: types_1.Activity.STANDING });
        }
        frames.push(frame);
    }
    return _playAnimation({
        frames: frames,
        delay: 50
    });
}
exports.playArrowAnimation = playArrowAnimation;
function playFloorFireAnimation(source, targets) {
    var frames = [];
    for (var i = 0; i < targets.length; i++) {
        var frame_1 = [];
        frame_1.push({ unit: source, activity: types_1.Activity.STANDING });
        for (var j = 0; j < targets.length; j++) {
            var activity = (j === i) ? types_1.Activity.DAMAGED : types_1.Activity.STANDING;
            frame_1.push({ unit: targets[j], activity: activity });
        }
        frames.push({ units: frame_1 });
    }
    // last frame (all standing)
    var frame = [];
    frame.push({ unit: source, activity: types_1.Activity.STANDING });
    for (var i = 0; i < targets.length; i++) {
        frame.push({ unit: targets[i], activity: types_1.Activity.STANDING });
    }
    frames.push({ units: frame });
    return _playAnimation({
        frames: frames,
        delay: FRAME_LENGTH
    });
}
exports.playFloorFireAnimation = playFloorFireAnimation;
function _playAnimation(animation) {
    var delay = animation.delay, frames = animation.frames;
    var promises = [];
    var _loop_1 = function (i) {
        var frame = frames[i];
        var map = jwb.state.getMap();
        promises.push(function () {
            var _a;
            if (!!frame.projectiles) {
                (_a = map.projectiles).push.apply(_a, frame.projectiles);
            }
            return PromiseUtils_1.resolvedPromise();
        });
        var updatePromise = function () {
            var updatePromises = [];
            for (var j = 0; j < frame.units.length; j++) {
                var _a = frame.units[j], unit = _a.unit, activity = _a.activity;
                unit.activity = activity;
                updatePromises.push(unit.sprite.update());
            }
            return Promise.all(updatePromises);
        };
        promises.push(updatePromise);
        promises.push(function () {
            return jwb.renderer.render();
        });
        if (i < (frames.length - 1)) {
            promises.push(function () {
                return PromiseUtils_1.wait(delay);
            });
        }
        promises.push(function () {
            if (!!frame.projectiles) {
                frame.projectiles.forEach(function (projectile) { return map.removeProjectile(projectile); });
            }
            return PromiseUtils_1.resolvedPromise();
        });
    };
    for (var i = 0; i < frames.length; i++) {
        _loop_1(i);
    }
    return PromiseUtils_1.chainPromises(promises);
}
//# sourceMappingURL=Animations.js.map