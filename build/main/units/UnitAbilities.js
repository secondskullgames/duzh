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
var Sounds_1 = require("../sounds/Sounds");
var types_1 = require("../types/types");
var SoundFX_1 = require("../sounds/SoundFX");
var UnitUtils_1 = require("./UnitUtils");
var Animations_1 = require("../graphics/animations/Animations");
var Ability = /** @class */ (function () {
    function Ability(name, cooldown, icon) {
        if (icon === void 0) { icon = null; }
        this.name = name;
        this.cooldown = cooldown;
        this.icon = icon;
    }
    return Ability;
}());
exports.Ability = Ability;
var NormalAttack = /** @class */ (function (_super) {
    __extends(NormalAttack, _super);
    function NormalAttack() {
        return _super.call(this, 'ATTACK', 0) || this;
    }
    NormalAttack.prototype.use = function (unit, direction) {
        if (!direction) {
            throw 'NormalAttack requires a direction!';
        }
        var dx = direction.dx, dy = direction.dy;
        var _a = { x: unit.x + dx, y: unit.y + dy }, x = _a.x, y = _a.y;
        var playerUnit = jwb.state.playerUnit;
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
                var targetUnit = map.getUnit({ x: x, y: y });
                if (!!targetUnit) {
                    UnitUtils_1.attack(unit, targetUnit)
                        .then(resolve);
                }
                else {
                    resolve();
                }
            }
        });
    };
    return NormalAttack;
}(Ability));
var HeavyAttack = /** @class */ (function (_super) {
    __extends(HeavyAttack, _super);
    function HeavyAttack() {
        return _super.call(this, 'HEAVY_ATTACK', 10, 'strong_icon') || this;
    }
    HeavyAttack.prototype.use = function (unit, direction) {
        if (!direction) {
            throw 'HeavyAttack requires a direction!';
        }
        var dx = direction.dx, dy = direction.dy;
        var _a = { x: unit.x + dx, y: unit.y + dy }, x = _a.x, y = _a.y;
        var playerUnit = jwb.state.playerUnit;
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
                var targetUnit = map.getUnit({ x: x, y: y });
                if (!!targetUnit) {
                    UnitUtils_1.heavyAttack(unit, targetUnit)
                        .then(resolve);
                }
                else {
                    resolve();
                }
            }
        });
    };
    return HeavyAttack;
}(Ability));
var ShootArrow = /** @class */ (function (_super) {
    __extends(ShootArrow, _super);
    function ShootArrow() {
        return _super.call(this, 'SHOOT_ARROW', 0) || this;
    }
    ShootArrow.prototype.use = function (unit, direction) {
        if (!direction) {
            throw 'ShootArrow requires a direction!';
        }
        var dx = direction.dx, dy = direction.dy;
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
    };
    return ShootArrow;
}(Ability));
var UnitAbilities = {
    ATTACK: new NormalAttack(),
    HEAVY_ATTACK: new HeavyAttack(),
    SHOOT_ARROW: new ShootArrow(),
};
exports.default = UnitAbilities;
//# sourceMappingURL=UnitAbilities.js.map