import PlayerUnitController from './controllers/PlayerUnitController';
import { UnitController } from './controllers/UnitController';
import Unit from './Unit';
import { PlayerUnitClass } from './PlayerUnitClass';
import { Faction } from './Faction';
import Equipment from '@main/equipment/Equipment';
import { ItemFactory } from '@main/items/ItemFactory';
import SpriteFactory from '@main/graphics/sprites/SpriteFactory';
import MapInstance from '@main/maps/MapInstance';
import { Coordinates } from '@duzh/geometry';
import { loadPaletteSwaps } from '@main/graphics/loadPaletteSwaps';
import { AssetBundle } from '@main/assets/AssetBundle';

type CreateUnitParams = Readonly<{
  /**
   * if undefined, default to unit model's name
   */
  name?: string;
  modelId: string;
  faction: Faction;
  controller: UnitController;
  level: number;
  coordinates: Coordinates;
  map: MapInstance;
  playerUnitClass?: PlayerUnitClass;
}>;

export default class UnitFactory {
  constructor(
    private readonly assetBundle: AssetBundle,
    private readonly spriteFactory: SpriteFactory,
    private readonly itemFactory: ItemFactory
  ) {}

  createUnit = async (params: CreateUnitParams): Promise<Unit> => {
    const { itemFactory, spriteFactory } = this;
    const model = this.assetBundle.getUnitModel(params.modelId);
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
      modelId: 'player',
      faction: Faction.PLAYER,
      controller: new PlayerUnitController(),
      level: 1,
      coordinates,
      map,
      playerUnitClass: PlayerUnitClass.DEFAULT
    });
}
