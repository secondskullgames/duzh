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
import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import ItemFactory from '../../items/ItemFactory';

type CreateUnitParams = Readonly<{
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

type props = Readonly<{
  spriteFactory: SpriteFactory;
  itemFactory: ItemFactory;
}>;

export default class UnitFactory {
  private readonly spriteFactory: SpriteFactory;
  private readonly itemFactory: ItemFactory;

  constructor(props: props) {
    this.spriteFactory = props.spriteFactory;
    this.itemFactory = props.itemFactory;
  }

  createUnit = async (params: CreateUnitParams): Promise<Unit> => {
    const { itemFactory, spriteFactory } = this;
    const { name, unitClass, faction, controller, level, coordinates, playerUnitClass } =
      params;
    const model: UnitModel = await loadUnitModel(unitClass);
    const sprite = await spriteFactory.createUnitSprite(
      model.sprite,
      PaletteSwaps.create(model.paletteSwaps)
    );
    const equipmentList: Equipment[] = [];
    for (const equipmentClass of model.equipment ?? []) {
      const equipment = await itemFactory.createEquipment(equipmentClass);
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

  createPlayerUnit = async (): Promise<Unit> => {
    const unit = await this.createUnit({
      unitClass: 'player',
      faction: Faction.PLAYER,
      controller: new PlayerUnitController(),
      level: 1,
      coordinates: { x: 0, y: 0 },
      playerUnitClass: PlayerUnitClass.DEFAULT
    });
    if (!Feature.isEnabled(Feature.LEVEL_UP_SCREEN)) {
      unit.learnAbility(abilityForName(AbilityName.DASH));
    }
    return unit;
  };

  loadAllModels = async (): Promise<UnitModel[]> => {
    const requireContext = require.context('../../../../data/units', false, /\.json$/i);

    const models: UnitModel[] = [];
    for (const filename of requireContext.keys()) {
      const model = (await requireContext(filename)) as UnitModel;
      models.push(model);
    }
    return models;
  };
}
