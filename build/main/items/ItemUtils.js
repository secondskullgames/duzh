import { playSound } from '../sounds/AudioUtils.js';
import Sounds from '../sounds/Sounds.js';
function pickupItem(unit, mapItem) {
    var state = jwb.state;
    var inventoryItem = mapItem.inventoryItem;
    unit.inventory.add(inventoryItem);
    state.messages.push("Picked up a " + inventoryItem.name + ".");
    playSound(Sounds.PICK_UP_ITEM);
}
function useItem(unit, item) {
    return item.use(unit)
        .then(function () { return unit.inventory.remove(item); });
}
export { pickupItem, useItem };
//# sourceMappingURL=ItemUtils.js.map