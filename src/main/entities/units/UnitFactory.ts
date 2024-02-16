import PlayerUnitController from './controllers/PlayerUnitController';
import { UnitController } from './controllers/UnitController';
import Unit from './Unit';
import { abilityForName } from './abilities/abilityForName';
import { AbilityName } from './abilities/AbilityName';
import { PlayerUnitClass } from './PlayerUnitClass';
import Coordinates from '../../geometry/Coordinates';
import PaletteSwaps from '../../graphics/PaletteSwaps';
import { Faction } from '../../types/types';
import Equipment from '../../equipment/Equipment';
import UnitModel from '../../schemas/UnitModel';
import { Feature } from '../../utils/features';
import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import ItemFactory from '../../items/ItemFactory';
import MapInstance from '../../maps/MapInstance';
import ModelLoader from '../../utils/ModelLoader';
import { inject, injectable } from 'inversify';

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
  map: MapInstance;
  playerUnitClass?: PlayerUnitClass;
}>;

@injectable()
export default class UnitFactory {
  constructor(
    @inject(SpriteFactory)
    private readonly spriteFactory: SpriteFactory,
    @inject(ItemFactory)
    private readonly itemFactory: ItemFactory,
    @inject(ModelLoader)
    private readonly modelLoader: ModelLoader
  ) {}

  createUnit = async (params: CreateUnitParams): Promise<Unit> => {
    const { itemFactory, spriteFactory } = this;
    const model: UnitModel = await this.modelLoader.loadUnitModel(params.unitClass);
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
      name: params.name ?? model.name,
      model,
      faction: params.faction,
      controller: params.controller,
      level: params.level,
      coordinates: params.coordinates,
      map: params.map,
      equipment: equipmentList,
      sprite,
      playerUnitClass: params.playerUnitClass
    });
  };

  createPlayerUnit = async (
    coordinates: Coordinates,
    map: MapInstance
  ): Promise<Unit> => {
    const unit = await this.createUnit({
      unitClass: 'player',
      faction: Faction.PLAYER,
      controller: new PlayerUnitController(),
      level: 1,
      coordinates,
      map,
      playerUnitClass: PlayerUnitClass.DEFAULT
    });
    if (!Feature.isEnabled(Feature.LEVEL_UP_SCREEN)) {
      unit.learnAbility(abilityForName(AbilityName.DASH));
    }
    return unit;
  };
}
