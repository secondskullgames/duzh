"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SoundFX_1 = require("../sounds/SoundFX");
var Sounds_1 = require("../sounds/Sounds");
function pickupItem(unit, mapItem) {
    var state = jwb.state;
    var inventoryItem = mapItem.inventoryItem;
    unit.inventory.add(inventoryItem);
    state.messages.push("Picked up a " + inventoryItem.name + ".");
    SoundFX_1.playSound(Sounds_1.default.PICK_UP_ITEM);
}
exports.pickupItem = pickupItem;
function useItem(unit, item) {
    return item.use(unit)
        .then(function () { return unit.inventory.remove(item); });
}
exports.useItem = useItem;
//# sourceMappingURL=ItemUtils.js.map