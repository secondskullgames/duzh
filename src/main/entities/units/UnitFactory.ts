import Coordinates from '../../geometry/Coordinates';
import PaletteSwaps from '../../graphics/PaletteSwaps';
import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import ItemFactory from '../../items/ItemFactory';
import { Faction } from '../../types/types';
import { loadUnitModel } from '../../utils/models';
import PlayerUnitController from './controllers/PlayerUnitController';
import UnitController from './controllers/UnitController';
import Unit from './Unit';
import Equipment from '../../equipment/Equipment';
import UnitModel from '../../schemas/UnitModel';
import ImageFactory from '../../graphics/images/ImageFactory';
import GameRenderer from '../../graphics/renderers/GameRenderer';
import GameState from '../../core/GameState';

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

type Props = Readonly<{
  state: GameState,
  renderer: GameRenderer,
  imageFactory: ImageFactory
}>;

const createUnit = async (
  { name, unitClass, faction, controller, level, coordinates }: CreateUnitProps,
  { state, renderer, imageFactory }: Props
): Promise<Unit> => {
  const model: UnitModel = await loadUnitModel(unitClass);
  const sprite = await SpriteFactory.createUnitSprite(
    model.sprite,
    PaletteSwaps.create(model.paletteSwaps),
    { imageFactory }
  );
  const equipmentList: Equipment[] = [];
  for (const equipmentClass of (model.equipment ?? [])) {
    const equipment = await ItemFactory.createEquipment(
      equipmentClass,
      { state, renderer, imageFactory }
    );
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

const createPlayerUnit = async ({ state, renderer, imageFactory }: Props): Promise<Unit> => createUnit(
  {
    unitClass: 'player',
    faction: Faction.PLAYER,
    controller: PlayerUnitController.getInstance(),
    level: 1,
    coordinates: { x: 0, y: 0 }
  },
  { state, renderer, imageFactory }
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
