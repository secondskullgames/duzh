import PlayerUnitController from './controllers/PlayerUnitController';
import { UnitController } from './controllers/UnitController';
import Unit from './Unit';
import { PlayerUnitClass } from './PlayerUnitClass';
import { Faction } from './Faction';
import Equipment from '@main/equipment/Equipment';
import { ItemFactory } from '@main/items/ItemFactory';
import SpriteFactory from '@main/graphics/sprites/SpriteFactory';
import MapInstance from '@main/maps/MapInstance';
import { UnitModel } from '@models/UnitModel';
import { Coordinates } from '@lib/geometry/Coordinates';
import ModelLoader from '@main/assets/ModelLoader';
import { loadPaletteSwaps } from '@main/graphics/loadPaletteSwaps';
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
}>;

@injectable()
export default class UnitFactory {
  constructor(
    @inject(SpriteFactory)
    private readonly spriteFactory: SpriteFactory,
    @inject(ItemFactory)
    private readonly itemFactory: ItemFactory,
    @inject(ModelLoader)
    private readonly modelLoader: ModelLoader,
    @inject(PlayerUnitClass)
    private readonly playerUnitClass: PlayerUnitClass
  ) {}

  createUnit = async (params: CreateUnitParams): Promise<Unit> => {
    const { itemFactory, spriteFactory } = this;
    const model: UnitModel = await this.modelLoader.loadUnitModel(params.unitClass);
    const sprite = await spriteFactory.createUnitSprite(
      model.sprite,
      loadPaletteSwaps(model.paletteSwaps)
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
      playerUnitClass:
        params.faction === Faction.PLAYER ? this.playerUnitClass : undefined
    });
  };

  createPlayerUnit = async (coordinates: Coordinates, map: MapInstance): Promise<Unit> =>
    this.createUnit({
      unitClass: 'player',
      faction: Faction.PLAYER,
      controller: new PlayerUnitController(),
      level: 1,
      coordinates,
      map
    });
}
