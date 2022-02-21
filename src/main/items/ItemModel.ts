import InventoryItem from './InventoryItem';
import ItemFactory from './ItemFactory';

type ItemModel = {
  id: string,
  mapSprite: string,
  getInventoryItem: () => Promise<InventoryItem>
};

namespace ItemModel {
  export const life_potion: ItemModel = {
    id: 'life_potion',
    mapSprite: 'map_potion',
    getInventoryItem: () => Promise.resolve(ItemFactory.createPotion(40))
  };

  export const floor_fire_scroll: ItemModel = {
    id: 'floor_fire_scroll',
    mapSprite: 'map_scroll',
    getInventoryItem: () => ItemFactory.createScrollOfFloorFire(80)
  };

  export const key: ItemModel = {
    id: 'key',
    mapSprite: 'map_key',
    getInventoryItem: () => Promise.resolve(ItemFactory.createKey())
  };

  export const values = () => [life_potion, floor_fire_scroll, key];
  export const load = (id: string): ItemModel => values().find(itemClass => itemClass.id === id)!!;
}

export default ItemModel;
