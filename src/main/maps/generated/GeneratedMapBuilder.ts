import { GeneratedMapModel_PointAllocation } from '../../../gen-schema/generated-map.schema';
import GameState from '../../core/GameState';
import equipment from '../../equipment/Equipment';
import equipmentClass from '../../equipment/EquipmentClass';
import EquipmentClass from '../../equipment/EquipmentClass';
import ItemClass from '../../items/ItemClass';
import ItemFactory from '../../items/ItemFactory';
import MapItem from '../../objects/MapItem';
import Tile from '../../tiles/Tile';
import { ARCHER, HUMAN_REDESIGN } from '../../units/controllers/AIUnitControllers';
import Unit from '../../units/Unit';
import UnitClass from '../../units/UnitClass';
import UnitFactory from '../../units/UnitFactory';
import { randChoice } from '../../utils/random';
import MapInstance from '../MapInstance';
import UnitController from '../../units/controllers/UnitController';
import { getUnoccupiedLocations } from '../MapUtils';

type Props = {
  level: number,
  width: number,
  height: number,
  tiles: Tile[][],
  pointAllocation: GeneratedMapModel_PointAllocation
};

class GeneratedMapBuilder {
  private readonly level: number;
  private readonly width: number;
  private readonly height: number;
  private readonly tiles: Tile[][];
  private readonly pointAllocation: GeneratedMapModel_PointAllocation;

  constructor({
    level,
    width,
    height,
    tiles,
    pointAllocation
  }: Props) {
    this.level = level;
    this.width = width;
    this.height = height;
    this.tiles = tiles;
    this.pointAllocation = pointAllocation;
  }

  build = async (): Promise<MapInstance> => {
    const candidateLocations = getUnoccupiedLocations(this.tiles, ['FLOOR'], []);
    const playerUnit = GameState.getInstance().getPlayerUnit();
    const playerUnitCoordinates = candidateLocations.shift()!;
    playerUnit.setCoordinates(playerUnitCoordinates);
    const units = [playerUnit, ...await this._generateUnits()];
    const items: MapItem[] = await this._generateItems();

    return new MapInstance({
      width: this.width,
      height: this.height,
      tiles: this.tiles,
      units,
      items,
      doors: [],
      spawners: [],
      music: null
    });
  };

  _generateUnits = async (): Promise<Unit[]> => {
    const unitPromises: Promise<Unit>[] = [];
    const candidateLocations = getUnoccupiedLocations(this.tiles, ['FLOOR'], []);
    let points = this.pointAllocation.enemies;

    while (points > 0) {
      const possibleUnitClasses = (await UnitClass.loadAll())
        .filter(unitClass => unitClass.level !== null && unitClass.level <= this.level)
        .filter(unitClass => unitClass.points !== null && unitClass.points <= points);

      if (possibleUnitClasses.length === 0) {
        break;
      }

      const unitClass = randChoice(possibleUnitClasses);
      const { x, y } = candidateLocations.shift()!;
      let controller: UnitController;
      if (unitClass.name === 'Goblin Archer') {
        controller = ARCHER;
      } else {
        controller = HUMAN_REDESIGN;
      }
      const promise = UnitFactory.createUnit({
        name: unitClass.name, // TODO unique names?
        unitClass,
        controller,
        faction: 'ENEMY',
        coordinates: { x, y },
        level: this.level
      });
      unitPromises.push(promise);
      points -= unitClass.points!;
    }
    return Promise.all(unitPromises);
  };

  private _generateItems = async (): Promise<MapItem[]> => {
    const itemPromises: Promise<MapItem>[] = [];
    const candidateLocations = getUnoccupiedLocations(this.tiles, ['FLOOR'], []);

    let points = this.pointAllocation.equipment;
    while (points > 0) {
      const possibleEquipmentClasses = (await EquipmentClass.loadAll())
        .filter(equipmentClass => equipmentClass.level !== null && equipmentClass.level <= this.level)
        .filter(equipmentClass => equipmentClass.points !== null && equipmentClass.points <= points);

      if (possibleEquipmentClasses.length === 0) {
        break;
      }

      const equipmentClass = randChoice(possibleEquipmentClasses);
      const { x, y } = candidateLocations.shift()!;
      const promise = ItemFactory.createMapEquipment(equipmentClass, { x, y });
      itemPromises.push(promise);
      points -= equipmentClass.points!;
    }

    points = this.pointAllocation.items;
    while (points > 0) {
      const possibleItemClasses = ItemClass.values()
        .filter(itemClass => itemClass.level !== null && itemClass.level <= this.level)
        .filter(itemClass => itemClass.points !== null && itemClass.points <= points);

      if (possibleItemClasses.length === 0) {
        break;
      }

      const itemClass = randChoice(possibleItemClasses);
      const { x, y } = candidateLocations.shift()!;
      const promise = ItemFactory.createMapItem(itemClass, { x, y });
      itemPromises.push(promise);
      points -= itemClass.points!;
    }

    return Promise.all(itemPromises);
  };
}

export default GeneratedMapBuilder;
