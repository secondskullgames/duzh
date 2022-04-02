import EquipmentClass from '../equipment/EquipmentClass';
import DynamicSprite from '../graphics/sprites/DynamicSprite';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import EquipmentModel from '../equipment/EquipmentModel';
import ItemFactory from '../items/ItemFactory';
import Coordinates from '../geometry/Coordinates';
import { Faction } from '../types/types';
import PlayerUnitController from './controllers/PlayerUnitController';
import UnitController from './controllers/UnitController';
import Unit from './Unit';
import UnitClass from './UnitClass';

type CreateUnitProps = {
  name: string,
  unitClass: UnitClass,
  faction: Faction,
  controller: UnitController,
  level: number,
  coordinates: Coordinates
};

const createUnit = async ({ name, unitClass, faction, controller, level, coordinates }: CreateUnitProps): Promise<Unit> => {
  const spritePromise: Promise<DynamicSprite<Unit>> = SpriteFactory.createUnitSprite(unitClass.sprite, unitClass.paletteSwaps);
  const equipmentPromises = Promise.all(
    (unitClass.equipment || [])?.map(id => EquipmentClass.load(id).then(ItemFactory.createEquipment))
  );

  const [sprite, equipment] = await Promise.all([spritePromise, equipmentPromises]);

  return new Unit({
    name,
    unitClass,
    faction,
    controller,
    level,
    coordinates,
    equipment,
    sprite
  });
};

const createPlayerUnit = async () => createUnit({
  name: 'player',
  unitClass: await UnitClass.load('player'),
  faction: 'PLAYER',
  controller: PlayerUnitController.getInstance(),
  level: 1,
  coordinates: { x: 0, y: 0 }
});

export default {
  createUnit,
  createPlayerUnit
};
