import { EquipmentSlot } from '../types/types.js';
import { playSound } from '../sounds/AudioUtils.js';
import Sounds from '../sounds/Sounds.js';
import { playArrowAnimation, playAttackingAnimation } from '../graphics/animations/Animations.js';
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
                playSound(Sounds.FOOTSTEP);
            }
            resolve();
        }
        else {
            var targetUnit_1 = map.getUnit({ x: x, y: y });
            if (!!targetUnit_1) {
                var damage_1 = unit.getDamage();
                messages.push(unit.name + " (" + unit.level + ") hit " + targetUnit_1.name + " (" + targetUnit_1.level + ") for " + damage_1 + " damage!");
                playAttackingAnimation(unit, targetUnit_1)
                    .then(function () { return targetUnit_1.takeDamage(damage_1, unit); })
                    .then(function () { return resolve(); });
            }
            else {
                resolve();
            }
        }
    });
}
function fireProjectile(unit, _a) {
    var dx = _a.dx, dy = _a.dy;
    unit.direction = { dx: dx, dy: dy };
    return unit.sprite.update()
        .then(function () { return jwb.renderer.render(); })
        .then(function () { return new Promise(function (resolve) {
        if (!unit.equipment.get(EquipmentSlot.RANGED_WEAPON)) {
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
            messages.push(unit.name + " (" + unit.level + ") hit " + targetUnit.name + " (" + targetUnit.level + ") for " + damage_2 + " damage!");
            playArrowAnimation(unit, { dx: dx, dy: dy }, coordinatesList, targetUnit)
                .then(function () { return targetUnit.takeDamage(damage_2, unit); })
                .then(function () { return resolve(); });
        }
        else {
            playArrowAnimation(unit, { dx: dx, dy: dy }, coordinatesList, null)
                .then(function () { return resolve(); });
        }
    }); });
}
export { moveOrAttack, fireProjectile };
//# sourceMappingURL=UnitUtils.js.map