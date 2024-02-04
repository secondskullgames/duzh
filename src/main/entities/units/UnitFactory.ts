import PlayerUnitController from './controllers/PlayerUnitController';
import { UnitController } from './controllers/UnitController';
import Unit from './Unit';
import { abilityForName } from './abilities/abilityForName';
import { AbilityName } from './abilities/AbilityName';
import { PlayerUnitClass } from './PlayerUnitClass';
import Coordinates from '../../geometry/Coordinates';
import PaletteSwaps from '../../graphics/PaletteSwaps';
import { Faction } from '../../types/types';
import { loadUnitModel } from '../../utils/models';
import Equipment from '../../equipment/Equipment';
import UnitModel from '../../schemas/UnitModel';
import { Feature } from '../../utils/features';
import { GameState } from '../../core/GameState';

type CreateUnitProps = Readonly<{
  /**
   * if undefined, default to unit model's name
   */
  name?: string;
  unitClass: string;
  faction: Faction;
  controller: UnitController;
  level: number;
  coordinates: Coordinates;
  playerUnitClass?: PlayerUnitClass;
}>;

const createUnit = async (props: CreateUnitProps, state: GameState): Promise<Unit> => {
  const { name, unitClass, faction, controller, level, coordinates, playerUnitClass } =
    props;
  const model: UnitModel = await loadUnitModel(unitClass);
  const sprite = await state
    .getSpriteFactory()
    .createUnitSprite(model.sprite, PaletteSwaps.create(model.paletteSwaps));
  const equipmentList: Equipment[] = [];
  for (const equipmentClass of model.equipment ?? []) {
    const equipment = await state.getItemFactory().createEquipment(equipmentClass);
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
    sprite,
    playerUnitClass
  });
};

const createPlayerUnit = async (state: GameState): Promise<Unit> => {
  const unit = await createUnit(
    {
      unitClass: 'player',
      faction: Faction.PLAYER,
      controller: new PlayerUnitController(),
      level: 1,
      coordinates: { x: 0, y: 0 },
      playerUnitClass: PlayerUnitClass.DEFAULT
    },
    state
  );
  if (!Feature.isEnabled(Feature.LEVEL_UP_SCREEN)) {
    unit.learnAbility(abilityForName(AbilityName.DASH));
  }
  return unit;
};

const loadAllModels = async (): Promise<UnitModel[]> => {
  const requireContext = require.context('../../../../data/units', false, /\.json$/i);

  const models: UnitModel[] = [];
  for (const filename of requireContext.keys()) {
    const model = (await requireContext(filename)) as UnitModel;
    models.push(model);
  }
  return models;
};

export default {
  createUnit,
  createPlayerUnit,
  loadAllModels
};
