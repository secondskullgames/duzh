"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("../types/types");
var Animations_1 = require("../graphics/animations/Animations");
var UnitAbilities_1 = require("./UnitAbilities");
function attack(unit, target) {
    var damage = unit.getDamage();
    jwb.state.messages.push(unit.name + " hit " + target.name);
    jwb.state.messages.push("for " + damage + " damage!");
    return Animations_1.playAttackingAnimation(unit, target)
        .then(function () { return target.takeDamage(damage, unit); });
}
exports.attack = attack;
function heavyAttack(unit, target) {
    var damage = unit.getDamage() * 2;
    jwb.state.messages.push(unit.name + " hit " + target.name);
    jwb.state.messages.push("for " + damage + " damage!");
    return unit.useAbility(UnitAbilities_1.default.HEAVY_ATTACK) // TODO this should not be hardcoded here
        .then(function () { return Animations_1.playAttackingAnimation(unit, target); })
        .then(function () { return target.takeDamage(damage, unit); });
}
exports.heavyAttack = heavyAttack;
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
            var damage_1 = unit.getRangedDamage();
            messages.push(unit.name + " hit " + targetUnit.name);
            messages.push("for " + damage_1 + " damage!");
            Animations_1.playArrowAnimation(unit, { dx: dx, dy: dy }, coordinatesList, targetUnit)
                .then(function () { return targetUnit.takeDamage(damage_1, unit); })
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