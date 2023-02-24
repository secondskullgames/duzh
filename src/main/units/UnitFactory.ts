import Coordinates from '../geometry/Coordinates';
import PaletteSwaps from '../graphics/PaletteSwaps';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import ItemFactory from '../items/ItemFactory';
import { Faction } from '../types/types';
import { loadUnitModel } from '../utils/models';
import PlayerUnitController from './controllers/PlayerUnitController';
import UnitController from './controllers/UnitController';
import Unit from './Unit';
import Equipment from '../equipment/Equipment';
import UnitModel from '../schemas/UnitModel';
import { checkNotNull } from '../utils/preconditions';

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
  itemFactory: ItemFactory
}>

export default class UnitFactory {
  private readonly itemFactory: ItemFactory;

  constructor({ itemFactory }: Props) {
    this.itemFactory = itemFactory;
  }

  createUnit = async ({ name, unitClass, faction, controller, level, coordinates }: CreateUnitProps): Promise<Unit> => {
    const model: UnitModel = await loadUnitModel(unitClass);
    const sprite = await SpriteFactory.createUnitSprite(model.sprite, PaletteSwaps.create(model.paletteSwaps));
    const equipmentList: Equipment[] = [];
    for (const equipmentClass of (model.equipment ?? [])) {
      const equipment = await this.itemFactory.createEquipment(equipmentClass);
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

  createPlayerUnit = async (): Promise<Unit> => this.createUnit({
    unitClass: 'player',
    faction: 'PLAYER',
    controller: PlayerUnitController.getInstance(),
    level: 1,
    coordinates: { x: 0, y: 0 }
  });

  loadAllModels = async (): Promise<UnitModel[]> => {
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

  private static instance: UnitFactory | null = null;

  static getInstance = (): UnitFactory => checkNotNull(UnitFactory.instance);
  static setInstance = (factory: UnitFactory) => { UnitFactory.instance = factory; };
}
