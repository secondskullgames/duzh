import { Unit } from './Unit';
import { PlayerUnitClass } from './PlayerUnitClass';
import { Faction } from './Faction';
import Equipment from '../../equipment/Equipment';
import UnitModel from '../../schemas/UnitModel';
import MapInstance from '../../maps/MapInstance';
import ModelLoader from '../../utils/ModelLoader';
import { ItemFactory } from '@main/items';
import { PaletteSwaps } from '@main/graphics';
import { Coordinates } from '@main/geometry';
import { SpriteFactory } from '@main/graphics/sprites';
import { PlayerUnitController, UnitController } from '@main/entities/units/controllers';
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
export class UnitFactory {
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

  createPlayerUnit = async (coordinates: Coordinates, map: MapInstance): Promise<Unit> =>
    this.createUnit({
      unitClass: 'player',
      faction: Faction.PLAYER,
      controller: new PlayerUnitController(),
      level: 1,
      coordinates,
      map,
      playerUnitClass: PlayerUnitClass.DEFAULT
    });
}
