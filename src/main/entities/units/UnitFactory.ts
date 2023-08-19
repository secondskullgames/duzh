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
import { Feature } from '../../utils/features';
import { abilityForName } from './abilities/abilityForName';
import { AbilityName } from './abilities/AbilityName';

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
  spriteFactory: SpriteFactory
}>;

const createUnit = async (
  { name, unitClass, faction, controller, level, coordinates }: CreateUnitProps,
  { spriteFactory }: Context
): Promise<Unit> => {
  const model: UnitModel = await loadUnitModel(unitClass);
  const sprite = await spriteFactory.createUnitSprite(
    model.sprite,
    PaletteSwaps.create(model.paletteSwaps)
  );
  const equipmentList: Equipment[] = [];
  for (const equipmentClass of (model.equipment ?? [])) {
    const equipment = await ItemFactory.createEquipment(
      equipmentClass,
      { spriteFactory }
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
  return unit;
};

const createPlayerUnit = async ({ spriteFactory }: Context): Promise<Unit> => {
  const unit = await createUnit(
    {
      unitClass: 'player',
      faction: Faction.PLAYER,
      controller: new PlayerUnitController(),
      level: 1,
      coordinates: { x: 0, y: 0 }
    },
    { spriteFactory }
  );
  if (!Feature.isEnabled(Feature.LEVEL_UP_SCREEN)) {
    unit.learnAbility(abilityForName(AbilityName.DASH));
  }
  return unit;
};

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
