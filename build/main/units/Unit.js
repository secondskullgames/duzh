"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sounds_1 = require("../sounds/Sounds");
var InventoryMap_1 = require("../items/InventoryMap");
var EquipmentMap_1 = require("../items/equipment/EquipmentMap");
var Music_1 = require("../sounds/Music");
var UnitAbilities_1 = require("./UnitAbilities");
var types_1 = require("../types/types");
var SoundFX_1 = require("../sounds/SoundFX");
var PromiseUtils_1 = require("../utils/PromiseUtils");
var LIFE_PER_TURN_MULTIPLIER = 0.005;
var Unit = /** @class */ (function () {
    function Unit(unitClass, name, level, _a) {
        var x = _a.x, y = _a.y;
        this.char = '@';
        this.unitClass = unitClass;
        this.sprite = unitClass.sprite(this, unitClass.paletteSwaps);
        this.inventory = new InventoryMap_1.default();
        this.equipment = new EquipmentMap_1.default();
        this.x = x;
        this.y = y;
        this.name = name;
        this.level = 1;
        this.experience = 0;
        this.life = unitClass.startingLife;
        this.maxLife = unitClass.startingLife;
        this.mana = unitClass.startingMana;
        this.maxMana = unitClass.startingMana;
        this.lifeRemainder = 0;
        this._damage = unitClass.startingDamage;
        this.controller = unitClass.controller;
        this.activity = types_1.Activity.STANDING;
        this.direction = null;
        this.remainingCooldowns = new Map();
        // TODO: this needs to be specifid to the player unit
        this.abilities = [UnitAbilities_1.default.ATTACK, UnitAbilities_1.default.HEAVY_ATTACK, UnitAbilities_1.default.KNOCKBACK_ATTACK, UnitAbilities_1.default.STUN_ATTACK];
        this.stunDuration = 0;
        while (this.level < level) {
            this._levelUp(false);
        }
    }
    Unit.prototype._upkeep = function () {
        // life regeneration
        var lifePerTurn = this.maxLife * LIFE_PER_TURN_MULTIPLIER;
        this.lifeRemainder += lifePerTurn;
        var deltaLife = Math.floor(this.lifeRemainder);
        this.lifeRemainder -= deltaLife;
        this.life = Math.min(this.life + deltaLife, this.maxLife);
        // I hate javascript, wtf is this callback signature
        this.remainingCooldowns.forEach(function (cooldown, ability, map) {
            map.set(ability, Math.max(cooldown - 1, 0));
        });
    };
    Unit.prototype._endOfTurn = function () {
        // decrement stun duration
        this.stunDuration = Math.max(this.stunDuration - 1, 0);
    };
    Unit.prototype.update = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this._upkeep();
            return resolve();
        })
            .then(function () {
            if (_this.stunDuration === 0) {
                return _this.controller.issueOrder(_this);
            }
            return PromiseUtils_1.resolvedPromise();
        })
            .then(function () { return _this.sprite.update(); })
            .then(function () { return _this._endOfTurn(); });
    };
    Unit.prototype.getDamage = function () {
        var damage = this._damage;
        this.equipment.getEntries()
            .filter(function (_a) {
            var slot = _a[0], item = _a[1];
            return (slot !== types_1.EquipmentSlot.RANGED_WEAPON);
        })
            .forEach(function (_a) {
            var slot = _a[0], item = _a[1];
            damage += (item.damage || 0);
        });
        return damage;
    };
    Unit.prototype.getRangedDamage = function () {
        var damage = this._damage;
        this.equipment.getEntries()
            .filter(function (_a) {
            var slot = _a[0], item = _a[1];
            return (slot !== types_1.EquipmentSlot.MELEE_WEAPON);
        })
            .forEach(function (_a) {
            var slot = _a[0], item = _a[1];
            if (slot === types_1.EquipmentSlot.RANGED_WEAPON) {
                damage += (item.damage || 0);
            }
            else {
                damage += (item.damage || 0) / 2;
            }
        });
        return Math.round(damage);
    };
    Unit.prototype._levelUp = function (withSound) {
        this.level++;
        var lifePerLevel = this.unitClass.lifePerLevel(this.level);
        this.maxLife += lifePerLevel;
        this.life += lifePerLevel;
        this._damage += this.unitClass.damagePerLevel(this.level);
        if (withSound) {
            SoundFX_1.playSound(Sounds_1.default.LEVEL_UP);
        }
    };
    Unit.prototype.gainExperience = function (experience) {
        this.experience += experience;
        var experienceToNextLevel = this.experienceToNextLevel();
        while (!!experienceToNextLevel && this.experience >= experienceToNextLevel) {
            this.experience -= experienceToNextLevel;
            this._levelUp(true);
        }
    };
    Unit.prototype.experienceToNextLevel = function () {
        var unitClass = this.unitClass;
        if (unitClass.experienceToNextLevel && (this.level < unitClass.maxLevel)) {
            return unitClass.experienceToNextLevel(this.level);
        }
        return null;
    };
    Unit.prototype.takeDamage = function (damage, sourceUnit) {
        var _this = this;
        if (sourceUnit === void 0) { sourceUnit = undefined; }
        var playerUnit = jwb.state.playerUnit;
        var map = jwb.state.getMap();
        return new Promise(function (resolve) {
            _this.life = Math.max(_this.life - damage, 0);
            if (_this.life === 0) {
                map.removeUnit(_this);
                if (_this === playerUnit) {
                    jwb.state.screen = types_1.GameScreen.GAME_OVER;
                    Music_1.default.stop();
                    SoundFX_1.playSound(Sounds_1.default.PLAYER_DIES);
                }
                else {
                    SoundFX_1.playSound(Sounds_1.default.ENEMY_DIES);
                }
                if (sourceUnit) {
                    sourceUnit.gainExperience(1);
                }
            }
            else {
                if (_this === playerUnit) {
                    SoundFX_1.playSound(Sounds_1.default.PLAYER_HITS_ENEMY);
                }
                else {
                    SoundFX_1.playSound(Sounds_1.default.ENEMY_HITS_PLAYER);
                }
            }
            resolve();
        });
    };
    ;
    Unit.prototype.getCooldown = function (ability) {
        return this.remainingCooldowns.get(ability) || 0;
    };
    Unit.prototype.useAbility = function (ability) {
        this.remainingCooldowns.set(ability, ability.cooldown);
    };
    return Unit;
}());
exports.default = Unit;
//# sourceMappingURL=Unit.js.map