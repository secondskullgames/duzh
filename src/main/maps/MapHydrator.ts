import Unit from '../units/Unit';
import GameObject from '../objects/GameObject';
import MapInstance from './MapInstance';
import TileFactory from '../tiles/TileFactory';
import UnitFactory from '../units/UnitFactory';
import ObjectFactory from '../objects/ObjectFactory';
import { ItemFactory } from '@main/items/ItemFactory';
import { Faction } from '@main/units/Faction';
import { chooseUnitController } from '@main/units/controllers/ControllerUtils';
import { Game } from '@main/core/Game';
import { MapTemplate } from './MapTemplate';
import { checkNotNull } from '@lib/utils/preconditions';

/**
 * Responsible for turning a {@code MapTemplate} into a real map.
 */
export class MapHydrator {
  constructor(
    private readonly tileFactory: TileFactory,
    private readonly objectFactory: ObjectFactory,
    private readonly unitFactory: UnitFactory,
    private readonly itemFactory: ItemFactory
  ) {}

  hydrateMap = async (template: MapTemplate, game: Game): Promise<MapInstance> => {
    const map = new MapInstance({
      id: template.id,
      width: template.width,
      height: template.height,
      levelNumber: template.levelNumber,
      startingCoordinates: template.startingCoordinates,
      music: template.music,
      fogParams: template.fogParams
    });

    const tileSet = await this.tileFactory.getTileSet(template.tileSet);
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tileType = checkNotNull(template.tiles.get({ x, y }));
        const tile = this.tileFactory.createTile({ tileSet, tileType }, { x, y }, map);
        map.addTile(tile);
      }
    }

    const units = await this._loadUnits(template, map);
    for (const unit of units) {
      map.addUnit(unit);
      game.state.addUnit(unit);
    }

    const objects = await this._loadObjects(template, map);
    for (const object of objects) {
      map.addObject(object);
    }
    return map;
  };

  private _loadUnits = async (
    template: MapTemplate,
    map: MapInstance
  ): Promise<Unit[]> => {
    const units: Unit[] = [];
    const { width, height } = template;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const unitModel = template.units.get({ x, y });
        if (unitModel) {
          const controller = chooseUnitController(unitModel.id);
          const unit = await this.unitFactory.createUnit({
            name: unitModel.name,
            unitClass: unitModel.id,
            faction: Faction.ENEMY,
            controller,
            level: map.levelNumber,
            coordinates: { x, y },
            map
          });
          units.push(unit);
        }
      }
    }
    return units;
  };

  private _loadObjects = async (
    template: MapTemplate,
    map: MapInstance
  ): Promise<GameObject[]> => {
    const objects: GameObject[] = [];
    const { width, height } = map;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const objectTemplates = template.objects.get({ x, y });
        for (const objectTemplate of objectTemplates) {
          switch (objectTemplate.type) {
            case 'door': {
              const door = await this.objectFactory.createDoor(
                { x, y },
                objectTemplate.direction,
                objectTemplate.locked,
                map
              );
              objects.push(door);
              break;
            }
            case 'mirror': {
              const spawner = await this.objectFactory.createMirror({ x, y }, map);
              objects.push(spawner);
              break;
            }
            case 'movable_block': {
              const block = await this.objectFactory.createMovableBlock({ x, y }, map);
              objects.push(block);
              break;
            }
            case 'vines': {
              const vines = await this.objectFactory.createVines({ x, y }, map);
              objects.push(vines);
              break;
            }
            case 'shrine': {
              const shrine = await this.objectFactory.createShrine({ x, y }, map);
              objects.push(shrine);
              break;
            }
            case 'item': {
              const item = await this.itemFactory.createMapItem(
                objectTemplate.model.id,
                { x, y },
                map
              );
              objects.push(item);
            }
            case 'equipment': {
              const equipment = await this.itemFactory.createMapEquipment(
                objectTemplate.model.id,
                { x, y },
                map
              );
              objects.push(equipment);
            }
          }
        }
      }
    }
    return objects;
  };
}
