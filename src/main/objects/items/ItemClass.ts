import InventoryItem from './InventoryItem';
import ItemFactory from './ItemFactory';

type ItemClass = {
  id: string,
  mapSprite: string,
  getInventoryItem: () => Promise<InventoryItem>
};

namespace ItemClass {
  export const life_potion: ItemClass = {
    id: 'life_potion',
    mapSprite: 'map_potion',
    getInventoryItem: () => Promise.resolve(ItemFactory.createPotion(40))
  };

  export const floor_fire_scroll: ItemClass = {
    id: 'floor_fire_scroll',
    mapSprite: 'map_scroll',
    getInventoryItem: () => ItemFactory.createScrollOfFloorFire(80)
  };

  export const values = () => [life_potion, floor_fire_scroll];
  export const load = (id: string): ItemClass => values().find(itemClass => itemClass.id === id)!!;
}

export default ItemClass;
