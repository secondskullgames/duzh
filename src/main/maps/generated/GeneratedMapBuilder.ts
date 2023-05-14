import GameState from '../../core/GameState';
import Coordinates from '../../geometry/Coordinates';
import { CustomSet } from '../../types/CustomSet';
import ItemFactory from '../../items/ItemFactory';
import Tile from '../../tiles/Tile';
import Unit from '../../entities/units/Unit';
import UnitFactory from '../../entities/units/UnitFactory';
import { sortByReversed } from '../../utils/arrays';
import { randChoice } from '../../utils/random';
import MapInstance from '../MapInstance';
import { UnitController } from '../../entities/units/controllers/UnitController';
import { getUnoccupiedLocations, hypotenuse } from '../MapUtils';
import ArcherController from '../../entities/units/controllers/ArcherController';
import BasicEnemyController from '../../entities/units/controllers/BasicEnemyController';
import { GeneratedMapModel_PointAllocation } from '../../schemas/GeneratedMapModel';
import { checkNotNull } from '../../utils/preconditions';
import GameObject from '../../entities/objects/GameObject';
import { Faction } from '../../types/types';
import ImageFactory from '../../graphics/images/ImageFactory';
import GameRenderer from '../../graphics/renderers/GameRenderer';

type Props = Readonly<{
  level: number,
  width: number,
  height: number,
  tiles: Tile[][],
  pointAllocation: GeneratedMapModel_PointAllocation
}>;

type BuildProps = Readonly<{
  state: GameState,
  imageFactory: ImageFactory
}>;

export default class GeneratedMapBuilder {
  private readonly level: number;
  private readonly width: number;
  private readonly height: number;
  private readonly tiles: Tile[][];
  private readonly pointAllocation: GeneratedMapModel_PointAllocation;
  private readonly objectLocations: CustomSet<Coordinates>;

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
    this.objectLocations = new CustomSet();
  }

  build = async ({ state, imageFactory }: BuildProps): Promise<MapInstance> => {
    const candidateLocations = getUnoccupiedLocations(this.tiles, ['FLOOR'], []);
    const playerUnit = state.getPlayerUnit();
    const playerUnitCoordinates = checkNotNull(candidateLocations.shift());
    playerUnit.setCoordinates(playerUnitCoordinates);
    this.objectLocations.add(playerUnitCoordinates);
    const units = [playerUnit, ...await this._generateUnits({ state, imageFactory })];
    const objects: GameObject[] = await this._generateObjects({ state, imageFactory });

    return new MapInstance({
      width: this.width,
      height: this.height,
      tiles: this.tiles,
      units,
      objects,
      music: null
    });
  };

  _generateUnits = async ({ state, imageFactory }: BuildProps): Promise<Unit[]> => {
    const units: Unit[] = [];
    const candidateLocations = getUnoccupiedLocations(this.tiles, ['FLOOR'], []);
    let points = this.pointAllocation.enemies;

    while (points > 0) {
      const possibleUnitModels = (await UnitFactory.loadAllModels())
        .filter(model => model.level !== null && model.level <= this.level)
        .filter(model => model.points !== null && model.points <= points);

      if (possibleUnitModels.length === 0) {
        break;
      }

      const model = randChoice(possibleUnitModels);
      sortByReversed(
        candidateLocations,
        loc => Math.min(...this.objectLocations.values().map(({ x, y }) => hypotenuse(loc, { x, y })))
      );
      const { x, y } = candidateLocations.shift()!;
      let controller: UnitController;
      // TODO super hack!
      if (model.name === 'Goblin Archer') {
        controller = new ArcherController();
      } else {
        controller = new BasicEnemyController();
      }
      const unit = await UnitFactory.createUnit(
        {
          unitClass: model.id,
          controller,
          faction: Faction.ENEMY,
          coordinates: { x, y },
          level: this.level
        },
        {
          imageFactory
        }
      );
      units.push(unit);
      points -= model.points!;
      this.objectLocations.add({ x, y });
    }
    return units;
  };

  private _generateObjects = async ({ state, imageFactory }: BuildProps): Promise<GameObject[]> => {
    const objects: GameObject[] = [];
    const candidateLocations = getUnoccupiedLocations(this.tiles, ['FLOOR'], []);

    let points = this.pointAllocation.equipment;
    while (points > 0) {
      const possibleEquipmentClasses = (await ItemFactory.loadAllEquipmentModels())
        .filter(equipmentClass => equipmentClass.level !== null && equipmentClass.level <= this.level)
        .filter(equipmentClass => equipmentClass.points !== null && equipmentClass.points <= points);

      if (possibleEquipmentClasses.length === 0) {
        break;
      }

      const equipmentClass = randChoice(possibleEquipmentClasses);
      sortByReversed(
        candidateLocations,
        loc => Math.min(...this.objectLocations.values().map(({ x, y }) => hypotenuse(loc, { x, y })))
      );
      const coordinates = checkNotNull(candidateLocations.shift());
      const item = await ItemFactory.createMapEquipment(
        equipmentClass.id,
        coordinates,
        { imageFactory }
      );
      objects.push(item);
      points -= equipmentClass.points!;
      this.objectLocations.add(coordinates);
    }

    points = this.pointAllocation.items;
    while (points > 0) {
      const possibleItemClasses = (await ItemFactory.loadAllConsumableModels())
        .filter(itemClass => itemClass.level !== null && itemClass.level <= this.level)
        .filter(itemClass => itemClass.points !== null && itemClass.points <= points);

      if (possibleItemClasses.length === 0) {
        break;
      }

      const itemClass = randChoice(possibleItemClasses);
      sortByReversed(
        candidateLocations,
        loc => Math.min(...this.objectLocations.values().map(({ x, y }) => hypotenuse(loc, { x, y })))
      );
      const coordinates = checkNotNull(candidateLocations.shift());
      const item = await ItemFactory.createMapItem(
        itemClass.id,
        coordinates,
        { imageFactory }
      );
      objects.push(item);
      points -= itemClass.points!;
      this.objectLocations.add(coordinates);
    }

    return objects;
  };
}
