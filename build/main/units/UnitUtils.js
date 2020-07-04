"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Animations_1 = require("../graphics/animations/Animations");
var UnitAbilities_1 = require("./UnitAbilities");
function attack(unit, target) {
    var damage = unit.getDamage();
    jwb.state.messages.push(unit.name + " hit " + target.name + " for " + damage + " damage!");
    return Animations_1.playAttackingAnimation(unit, target)
        .then(function () { return target.takeDamage(damage, unit); });
}
exports.attack = attack;
function heavyAttack(unit, target) {
    var damage = unit.getDamage() * 2;
    jwb.state.messages.push(unit.name + " hit " + target.name + " for " + damage + " damage!");
    return unit.useAbility(UnitAbilities_1.default.HEAVY_ATTACK) // TODO this should not be hardcoded here
        .then(function () { return Animations_1.playAttackingAnimation(unit, target); })
        .then(function () { return target.takeDamage(damage, unit); });
}
exports.heavyAttack = heavyAttack;
//# sourceMappingURL=UnitUtils.js.map