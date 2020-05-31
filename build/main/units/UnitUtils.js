"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sounds_1 = require("../sounds/Sounds");
var types_1 = require("../types/types");
var SoundFX_1 = require("../sounds/SoundFX");
var Animations_1 = require("../graphics/animations/Animations");
function moveOrAttack(unit, _a) {
    var x = _a.x, y = _a.y;
    var _b = jwb.state, messages = _b.messages, playerUnit = _b.playerUnit;
    var map = jwb.state.getMap();
    unit.direction = { dx: x - unit.x, dy: y - unit.y };
    return new Promise(function (resolve) {
        var _a;
        if (map.contains({ x: x, y: y }) && !map.isBlocked({ x: x, y: y })) {
            _a = [x, y], unit.x = _a[0], unit.y = _a[1];
            if (unit === playerUnit) {
                SoundFX_1.playSound(Sounds_1.default.FOOTSTEP);
            }
            resolve();
        }
        else {
            var targetUnit_1 = map.getUnit({ x: x, y: y });
            if (!!targetUnit_1) {
                var damage_1 = unit.getDamage();
                messages.push(unit.name + " hit " + targetUnit_1.name);
                messages.push("for " + damage_1 + " damage!");
                Animations_1.playAttackingAnimation(unit, targetUnit_1)
                    .then(function () { return targetUnit_1.takeDamage(damage_1, unit); })
                    .then(function () { return resolve(); });
            }
            else {
                resolve();
            }
        }
    });
}
exports.moveOrAttack = moveOrAttack;
function fireProjectile(unit, _a) {
    var dx = _a.dx, dy = _a.dy;
    unit.direction = { dx: dx, dy: dy };
    return unit.sprite.update()
        .then(function () { return jwb.renderer.render(); })
        .then(function () { return new Promise(function (resolve) {
        if (!unit.equipment.get(types_1.EquipmentSlot.RANGED_WEAPON)) {
            // change direction and re-render, but don't do anything (don't spend a turn)
            resolve();
            return;
        }
        var map = jwb.state.getMap();
        var coordinatesList = [];
        var _a = { x: unit.x + dx, y: unit.y + dy }, x = _a.x, y = _a.y;
        while (map.contains({ x: x, y: y }) && !map.isBlocked({ x: x, y: y })) {
            coordinatesList.push({ x: x, y: y });
            x += dx;
            y += dy;
        }
        var targetUnit = map.getUnit({ x: x, y: y });
        if (!!targetUnit) {
            var messages = jwb.state.messages;
            var damage_2 = unit.getRangedDamage();
            messages.push(unit.name + " hit " + targetUnit.name);
            messages.push("for " + damage_2 + " damage!");
            Animations_1.playArrowAnimation(unit, { dx: dx, dy: dy }, coordinatesList, targetUnit)
                .then(function () { return targetUnit.takeDamage(damage_2, unit); })
                .then(function () { return resolve(); });
        }
        else {
            Animations_1.playArrowAnimation(unit, { dx: dx, dy: dy }, coordinatesList, null)
                .then(function () { return resolve(); });
        }
    }); });
}
exports.fireProjectile = fireProjectile;
//# sourceMappingURL=UnitUtils.js.map