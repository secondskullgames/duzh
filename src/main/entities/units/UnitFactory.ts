import Coordinates from '../../geometry/Coordinates';
import PaletteSwaps from '../../graphics/PaletteSwaps';
import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import ItemFactory from '../../items/ItemFactory';
import { Faction } from '../../types/types';
import { loadUnitModel } from '../../utils/models';
import PlayerUnitController from './controllers/PlayerUnitController';
import { UnitController } from './controllers/UnitController';
import Unit from './Unit';
import Equipment from '../../equipment/Equipment';
import UnitModel from '../../schemas/UnitModel';
import ImageFactory from '../../graphics/images/ImageFactory';

type CreateUnitProps = Readonly<{
  /**
   * if undefined, default to unit model's name
   */
  name?: string,
  unitClass: string,
  faction: Faction,
  controller: UnitController,
  level: number,
  coordinates: Coordinates
}>;

type Context = Readonly<{
  imageFactory: ImageFactory
}>;

const createUnit = async (
  { name, unitClass, faction, controller, level, coordinates }: CreateUnitProps,
  { imageFactory }: Context
): Promise<Unit> => {
  console.time(`createUnit [${unitClass}]`);
  console.time(`createUnit [${unitClass}] (model)`);
  const model: UnitModel = await loadUnitModel(unitClass);
  console.timeEnd(`createUnit [${unitClass}] (model)`);
  console.time(`createUnit [${unitClass}] (sprite)`);
  const sprite = await SpriteFactory.createUnitSprite(
    model.sprite,
    PaletteSwaps.create(model.paletteSwaps),
    { imageFactory }
  );
  console.timeEnd(`createUnit [${unitClass}] (sprite)`);
  const equipmentList: Equipment[] = [];
  for (const equipmentClass of (model.equipment ?? [])) {
    const equipment = await ItemFactory.createEquipment(
      equipmentClass,
      { imageFactory }
    );
    equipmentList.push(equipment);
  }

  const unit = new Unit({
    name: name ?? model.name,
    model,
    faction,
    controller,
    level,
    coordinates,
    equipment: equipmentList,
    sprite
  });
  console.timeEnd(`createUnit [${unitClass}]`);
  return unit;
};

const createPlayerUnit = async ({ imageFactory }: Context): Promise<Unit> => createUnit(
  {
    unitClass: 'player',
    faction: Faction.PLAYER,
    controller: new PlayerUnitController(),
    level: 1,
    coordinates: { x: 0, y: 0 }
  },
  { imageFactory }
);

const loadAllModels = async (): Promise<UnitModel[]> => {
  const requireContext = require.context(
    '../../../../data/units',
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
