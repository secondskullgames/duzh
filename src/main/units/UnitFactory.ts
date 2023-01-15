import { UnitModel } from '../../gen-schema/unit.schema';
import EquipmentClass from '../equipment/EquipmentClass';
import PaletteSwaps from '../graphics/PaletteSwaps';
import DynamicSprite from '../graphics/sprites/DynamicSprite';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import ItemFactory from '../items/ItemFactory';
import Coordinates from '../geometry/Coordinates';
import { Faction } from '../types/types';
import { loadModel } from '../utils/models';
import PlayerUnitController from './controllers/PlayerUnitController';
import UnitController from './controllers/UnitController';
import Unit from './Unit';

type CreateUnitProps = {
  /**
   * if undefined, default to unit model's name
   */
  name?: string,
  unitClass: string,
  faction: Faction,
  controller: UnitController,
  level: number,
  coordinates: Coordinates
};

const createUnit = async ({ name, unitClass, faction, controller, level, coordinates }: CreateUnitProps): Promise<Unit> => {
  const model: UnitModel = await loadModel(`units/${unitClass}`, 'unit');
  const spritePromise: Promise<DynamicSprite<Unit>> = SpriteFactory.createUnitSprite(model.sprite, PaletteSwaps.create(model.paletteSwaps));
  const equipmentPromises = Promise.all(
    (model.equipment ?? [])?.map(id => EquipmentClass.load(id).then(ItemFactory.createEquipment))
  );

  const [sprite, equipment] = await Promise.all([spritePromise, equipmentPromises]);

  return new Unit({
    name: name ?? model.id,
    model,
    faction,
    controller,
    level,
    coordinates,
    equipment,
    sprite
  });
};

const createPlayerUnit = async (): Promise<Unit> => createUnit({
  unitClass: 'player',
  faction: 'PLAYER',
  controller: PlayerUnitController.getInstance(),
  level: 1,
  coordinates: { x: 0, y: 0 }
});

const loadAllModels = async (): Promise<UnitModel[]> => {
  const requireContext = require.context(
    '../../../data/units',
    false,
    /\.json$/i
  );

  return Promise.all(
    requireContext.keys()
      .map(filename => requireContext(filename) as UnitModel)
  );
};

export default {
  createUnit,
  createPlayerUnit,
  loadAllModels
};
