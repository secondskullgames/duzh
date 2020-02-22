import InventoryItem from './InventoryItem';
import Entity from '../types/Entity';

interface MapItem extends Entity {
  inventoryItem?: () => InventoryItem
}

export default MapItem;