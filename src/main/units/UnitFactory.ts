import PlayerUnitController from './controllers/PlayerUnitController';
import { UnitController } from './controllers/UnitController';
import Unit from './Unit';
import { PlayerUnitClass } from './PlayerUnitClass';
import { Faction } from './Faction';
import Equipment from '@main/equipment/Equipment';
import MapInstance from '@main/maps/MapInstance';
import { UnitModel } from '@models/UnitModel';
import { Coordinates } from '@lib/geometry/Coordinates';
import { loadPaletteSwaps } from '@main/graphics/loadPaletteSwaps';
import { Globals } from '@main/core/globals';

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

export default class UnitFactory {
  createUnit = async (params: CreateUnitParams): Promise<Unit> => {
    const { itemFactory, spriteFactory, modelLoader } = Globals;
    const model: UnitModel = await modelLoader.loadUnitModel(params.unitClass);
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
