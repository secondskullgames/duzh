import Colors from '../graphics/Colors';
import PaletteSwaps from '../graphics/PaletteSwaps';
import InventoryItem from './InventoryItem';
import ItemFactory from './ItemFactory';

type ItemClass = {
  id: string,
  mapSprite: string,
  paletteSwaps?: PaletteSwaps,
  getInventoryItem: () => Promise<InventoryItem>
};

namespace ItemClass {
  export const life_potion: ItemClass = {
    id: 'life_potion',
    mapSprite: 'map_potion',
    getInventoryItem: () => Promise.resolve(ItemFactory.createLifePotion(40))
  };

  export const mana_potion: ItemClass = {
    id: 'mana_potion',
    mapSprite: 'map_potion',
    paletteSwaps: PaletteSwaps.builder()
      .addMapping(Colors.DARK_RED, Colors.BLUE)
      .addMapping(Colors.RED, Colors.CYAN)
      .build(),
    getInventoryItem: () => Promise.resolve(ItemFactory.createManaPotion(10))
  };

  export const floor_fire_scroll: ItemClass = {
    id: 'floor_fire_scroll',
    mapSprite: 'map_scroll',
    getInventoryItem: () => ItemFactory.createScrollOfFloorFire(50)
  };

  export const key: ItemClass = {
    id: 'key',
    mapSprite: 'map_key',
    getInventoryItem: () => Promise.resolve(ItemFactory.createKey())
  };

  export const values = () => [life_potion, mana_potion, floor_fire_scroll, key];
  export const load = (id: string): ItemClass => values().find(itemClass => itemClass.id === id)!;
}

export default ItemClass;
