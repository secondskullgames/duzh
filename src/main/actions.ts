/**
 * @return {!Promise<void>}
 */
import Sounds from './Sounds';
import GameState from './classes/GameState';
import Unit from './classes/Unit';
import SpriteRenderer from './classes/SpriteRenderer';
import { randChoice } from './utils/RandomUtils';
import MapFactory from './MapFactory';
import UnitClasses from './UnitClasses';
import MapSupplier, { createMap } from './classes/MapSupplier';
import Music from './Music';
import { playSound } from './audio';
import { contains, isTileRevealed } from './utils/MapUtils';
import { attachEvents } from './input';
import MapItem from './classes/MapItem';

function render(): Promise<void> {
  return new Promise(resolve => {
    resolve(jwb.renderer.render());
  });
}

/**
 * @return {!Promise<void>}
 */
function update() {
  const { state } = jwb;
  const { playerUnit, map } = jwb.state;

  return playerUnit.update()
    .then(() => render())
    .then(() => {
      /**
       * @type {!function(Promise<void>)[]}
       */
      const unitPromises = map.units
        .filter(u => u !== playerUnit)
        .map(u => {
          return () => (new Promise(resolve => {
            resolve();
          })
            .then(() => u.update()));
        });

      return _chainPromises(unitPromises)
        .then(() => render())
        .then(() => {
          state.turn++;
          state.messages = [];
        });
    });
}

function _chainPromises([first, ...rest]: (() => Promise<any>)[]) {
  if (!!first) {
    return first().then(() => _chainPromises(rest));
  }
  return new Promise(resolve => { resolve(); });
}

function pickupItem(unit: Unit, mapItem: MapItem) {
  const { state } = jwb;
  const inventoryItem = mapItem.inventoryItem();
  const { category } = inventoryItem;
  const { inventory } = unit;
  inventory[category] = inventory[category] || [];
  inventory[category].push(inventoryItem);
  state.inventoryIndex = state.inventoryIndex || 0;
  state.messages.push(`Picked up a ${inventoryItem.name}.`);
  playSound(Sounds.PICK_UP_ITEM);
}

/**
 * @param {!Unit} unit
 * @param {InventoryItem | null} item
 */
function useItem(unit, item) {
  const { state } = jwb;
  if (!!item) {
    item.use(unit);
    const items = unit.inventory[item.category];
    items.splice(state.inventoryIndex, 1);
    if (state.inventoryIndex >= items.length) {
      state.inventoryIndex--;
    }
  }
}

/**
 * @param {!int} index
 */
function loadMap(index) {
  const { state } = jwb;
  if (index >= state.mapSuppliers.length) {
    alert('YOU WIN!');
  } else {
    state.mapIndex = index;
    state.map = createMap(state.mapSuppliers[index]);
  }
}

function moveOrAttack(unit, { x, y }): Promise<void> {
  const { map, messages, playerUnit } = jwb.state;

  return new Promise(resolve => {
    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      [unit.x, unit.y] = [x, y];
      if (unit === playerUnit) {
        playSound(Sounds.FOOTSTEP);
      }
      resolve();
    } else {
      const targetUnit = map.getUnit({ x, y });
      if (!!targetUnit) {
        const damage = unit.getDamage();
        messages.push(`${unit.name} (${unit.level}) hit ${targetUnit.name} (${targetUnit.level}) for ${damage} damage!`);
        targetUnit.takeDamage(damage, unit);
      }
      setTimeout(() => resolve(), 250);
    }
  });
}

function restartGame() {
  const playerUnit = new Unit(UnitClasses.PLAYER, 'player', 1, { x: 0, y: 0 });
  jwb.state = new GameState(playerUnit, [
    // test
    //MapFactory.randomMap(20, 10, 3, 1),

    MapFactory.randomMap(1, 30, 22, 5, 4),
    MapFactory.randomMap(2, 32, 23, 6, 4),
    MapFactory.randomMap(3, 34, 24, 7, 3),
    MapFactory.randomMap(4, 36, 25, 8, 3),
    MapFactory.randomMap(5, 38, 26, 9, 3),
    MapFactory.randomMap(6, 30, 27, 10, 3)
  ]);

  jwb.renderer = new SpriteRenderer();

  loadMap(0);
  attachEvents();
  jwb.renderer.render();
  Music.playSuite(randChoice([Music.SUITE_1, Music.SUITE_2]));
}

/**
 * Add any tiles the player can currently see to the map's revealed tiles list.
 * @return void
 */
function revealTiles() {
  const { map, playerUnit } = jwb.state;

  map.rooms.forEach(room => {
    if (contains(room, playerUnit)) {
      for (let y = room.top; y < room.top + room.height; y++) {
        for (let x = room.left; x < room.left + room.width; x++) {
          if (!isTileRevealed({ x, y })) {
            map.revealedTiles.push({ x, y });
          }
        }
      }
    }
  });

  const radius = 2;

  for (let y = playerUnit.y - radius; y <= playerUnit.y + radius; y++) {
    for (let x = playerUnit.x - radius; x <= playerUnit.x + radius; x++) {
      if (!isTileRevealed({ x, y })) {
        map.revealedTiles.push({ x, y });
      }
    }
  }
}

export {
  render,
  update,
  pickupItem,
  useItem,
  loadMap,
  moveOrAttack,
  restartGame,
  revealTiles
};
