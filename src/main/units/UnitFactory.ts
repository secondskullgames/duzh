import { UnitModel } from '../../gen-schema/unit.schema';
import Coordinates from '../geometry/Coordinates';
import PaletteSwaps from '../graphics/PaletteSwaps';
import DynamicSprite from '../graphics/sprites/DynamicSprite';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import ItemFactory from '../items/ItemFactory';
import { Faction } from '../types/types';
import { loadModel } from '../utils/models';
import PlayerUnitController from './controllers/PlayerUnitController';
import UnitController from './controllers/UnitController';
import Unit from './Unit';
import Equipment from '../equipment/Equipment';
import { fillTemplate } from '../utils/templates';

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
  const sprite = await SpriteFactory.createUnitSprite(model.sprite, PaletteSwaps.create(model.paletteSwaps));
  const equipmentList: Equipment[] = [];
  for (const equipmentClass of (model.equipment ?? [])) {
    const equipment = await ItemFactory.createEquipment(equipmentClass);
    equipmentList.push(equipment);
  }

  return new Unit({
    name: name ?? model.name,
    model,
    faction,
    controller,
    level,
    coordinates,
    equipment: equipmentList,
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

  const models: UnitModel[] = [];
  for (const filename of requireContext.keys()) {
    const model = await requireContext(filename) as UnitModel;
    models.push(model);
  }
  return models;
};

export default {
  createUnit,
  createPlayerUnit,
  loadAllModels
};
