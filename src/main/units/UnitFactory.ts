import DynamicSprite from '../graphics/sprites/DynamicSprite';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import Equipment from '../items/equipment/Equipment';
import EquipmentClass from '../items/equipment/EquipmentClass';
import ItemFactory from '../items/ItemFactory';
import { Coordinates } from '../types/types';
import UnitController from './controllers/UnitController';
import Unit from './Unit';
import UnitClass from './UnitClass';

type CreateUnitProps = {
  name: string,
  unitClass: UnitClass,
  controller: UnitController,
  level: number,
  coordinates: Coordinates
};

const createUnit = async ({ name, unitClass, controller, level, coordinates }: CreateUnitProps): Promise<Unit> => {
  const spritePromise: Promise<DynamicSprite<Unit>> = SpriteFactory.createUnitSprite(unitClass.sprite, unitClass.paletteSwaps);
  const equipmentPromises = Promise.all(
    (unitClass.equipment || [])?.map(id => EquipmentClass.load(id).then(ItemFactory.createEquipment))
  );

  const [sprite, equipment] = await Promise.all([spritePromise, equipmentPromises]);

  return new Unit({
    name,
    unitClass,
    controller,
    level,
    coordinates,
    equipment,
    sprite
  });
};

export default {
  createUnit
};
