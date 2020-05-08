import { Activity, EquipmentSlot, GameScreen } from '../types/types.js';
import { playSound } from '../sounds/AudioUtils.js';
import Sounds from '../sounds/Sounds.js';
import { resolvedPromise } from '../utils/PromiseUtils.js';
import InventoryMap from '../items/InventoryMap.js';
import EquipmentMap from '../items/equipment/EquipmentMap.js';
import Music from '../sounds/Music.js';
var LIFE_PER_TURN_MULTIPLIER = 0.005;
var Unit = /** @class */ (function () {
    function Unit(unitClass, name, level, _a) {
        var x = _a.x, y = _a.y;
        this.char = '@';
        this.unitClass = unitClass;
        this.sprite = unitClass.sprite(this, unitClass.paletteSwaps);
        this.inventory = new InventoryMap();
        this.equipment = new EquipmentMap();
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
        this.queuedOrder = null;
        this.aiHandler = unitClass.aiHandler;
        this.activity = Activity.STANDING;
        this.direction = null;
        while (this.level < level) {
            this._levelUp(false);
        }
    }
    Unit.prototype._regenLife = function () {
        var lifePerTurn = this.maxLife * LIFE_PER_TURN_MULTIPLIER;
        this.lifeRemainder += lifePerTurn;
        var deltaLife = Math.floor(this.lifeRemainder);
        this.lifeRemainder -= deltaLife;
        this.life = Math.min(this.life + deltaLife, this.maxLife);
    };
    ;
    Unit.prototype.update = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this._regenLife();
            if (!!_this.queuedOrder) {
                var queuedOrder = _this.queuedOrder;
                _this.queuedOrder = null;
                return queuedOrder()
                    .then(function () { return resolve(); });
            }
            return resolve();
        })
            .then(function () {
            if (!!_this.aiHandler) {
                return _this.aiHandler(_this);
            }
            return resolvedPromise();
        })
            .then(function () { return _this.sprite.update(); });
    };
    Unit.prototype.getDamage = function () {
        var damage = this._damage;
        this.equipment.getEntries()
            .filter(function (_a) {
            var slot = _a[0], item = _a[1];
            return (slot !== EquipmentSlot.RANGED_WEAPON);
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
            return (slot !== EquipmentSlot.MELEE_WEAPON);
        })
            .forEach(function (_a) {
            var slot = _a[0], item = _a[1];
            if (slot === EquipmentSlot.RANGED_WEAPON) {
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
            playSound(Sounds.LEVEL_UP);
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
                    jwb.state.screen = GameScreen.GAME_OVER;
                    Music.stop();
                    playSound(Sounds.PLAYER_DIES);
                }
                else {
                    playSound(Sounds.ENEMY_DIES);
                }
                if (sourceUnit) {
                    sourceUnit.gainExperience(1);
                }
            }
            else {
                if (_this === playerUnit) {
                    playSound(Sounds.PLAYER_HITS_ENEMY);
                }
                else {
                    playSound(Sounds.ENEMY_HITS_PLAYER);
                }
            }
            resolve();
        });
    };
    ;
    return Unit;
}());
export default Unit;
//# sourceMappingURL=Unit.js.map