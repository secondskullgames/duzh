import { GameState } from '../../core/GameState';
import Coordinates from '../../geometry/Coordinates';
import { CustomSet } from '../../types/CustomSet';
import ItemFactory from '../../items/ItemFactory';
import Unit from '../../entities/units/Unit';
import { sortByReversed } from '../../utils/arrays';
import { randInt, weightedRandom } from '../../utils/random';
import MapInstance from '../MapInstance';
import { UnitController } from '../../entities/units/controllers/UnitController';
import { getUnoccupiedLocations, hypotenuse } from '../MapUtils';
import ArcherController from '../../entities/units/controllers/ArcherController';
import BasicEnemyController from '../../entities/units/controllers/BasicEnemyController';
import { checkNotNull, checkState } from '../../utils/preconditions';
import GameObject from '../../entities/objects/GameObject';
import { Faction } from '../../types/types';
import ImageFactory from '../../graphics/images/ImageFactory';
import { Feature } from '../../utils/features';
import { Range } from '../../schemas/GeneratedMapModel';
import UnitModel from '../../schemas/UnitModel';
import TileSet from '../../tiles/TileSet';
import TileType from '../../schemas/TileType';
import TileFactory from '../../tiles/TileFactory';

type Props = Readonly<{
  level: number;
  width: number;
  height: number;
  tiles: TileType[][];
  enemies: Range;
  items: Range;
  tileSet: TileSet;
  imageFactory: ImageFactory;
  tileFactory: TileFactory;
  itemFactory: ItemFactory;
}>;

/**
 * An uninitialized map, which hasn't yet been loaded in the game.
 */
export default class GeneratedMapBuilder {
  private readonly level: number;
  private readonly width: number;
  private readonly height: number;
  private readonly tiles: TileType[][];
  private readonly tileSet: TileSet;
  private readonly numEnemies: Range;
  private readonly numItems: Range;
  private readonly entityLocations: CustomSet<Coordinates>;
  private readonly tileFactory: TileFactory;
  private readonly itemFactory: ItemFactory;

  constructor(props: Props) {
    this.level = props.level;
    this.width = props.width;
    this.height = props.height;
    this.tiles = props.tiles;
    this.numEnemies = props.enemies;
    this.numItems = props.items;
    this.entityLocations = new CustomSet();
    this.tileSet = props.tileSet;
    this.tileFactory = props.tileFactory;
    this.itemFactory = props.itemFactory;
  }

  /**
   * TODO: it is really really really questionable that this moves the player unit
   * TODO: Need to put this somewhere else - this is core game logic, don't bury it
   */
  build = async (state: GameState): Promise<MapInstance> => {
    const candidateLocations = getUnoccupiedLocations(this.tiles, ['FLOOR'], []);
    const startingCoordinates = checkNotNull(candidateLocations.shift());

    if (Feature.isEnabled(Feature.STAIRS_UP)) {
      this.tiles[startingCoordinates.y][startingCoordinates.x] = 'STAIRS_UP';
    }
    this.entityLocations.add(startingCoordinates);

    const map = new MapInstance({
      width: this.width,
      height: this.height,
      startingCoordinates,
      music: null
    });

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.tileFactory.createTile(
          {
            tileType: this.tiles[y][x],
            tileSet: this.tileSet
          },
          { x, y },
          map
        );
        map.addTile(tile);
      }
    }
    const units = await this._generateUnits(state, map);
    for (const unit of units) {
      map.addUnit(unit);
    }
    const objects: GameObject[] = await this._generateObjects(state, map);
    for (const object of objects) {
      map.addObject(object);
    }

    return map;
  };

  private _generateUnits = async (
    state: GameState,
    map: MapInstance
  ): Promise<Unit[]> => {
    const units: Unit[] = [];
    const candidateLocations = getUnoccupiedLocations(this.tiles, ['FLOOR'], []).filter(
      coordinates => !this.entityLocations.includes(coordinates)
    );
    let enemiesRemaining = randInt(this.numEnemies.min, this.numEnemies.max);

    const allUnitModels = await state.getUnitFactory().loadAllModels();
    while (enemiesRemaining > 0) {
      const possibleUnitModels = allUnitModels.filter(model => {
        const { levelParameters } = model;
        if (levelParameters) {
          return (
            levelParameters.minLevel <= this.level &&
            levelParameters.maxLevel >= this.level
          );
        }
        return false;
      });

      if (possibleUnitModels.length === 0) {
        break;
      }

      // weighted random, favoring higher-level units
      const probabilities: Record<string, number> = {};
      const mappedUnitModels: Record<string, UnitModel> = {};
      for (const model of possibleUnitModels) {
        const key = model.id;
        // Each rarity is 2x less common than the previous rarity.
        // So P[rarity] = 2 ^ -rarity
        probabilities[key] = 1 / 2 ** (model?.levelParameters!.rarity ?? 0);
        mappedUnitModels[key] = model;
      }
      const model = weightedRandom(probabilities, mappedUnitModels);
      sortByReversed(candidateLocations, loc =>
        Math.min(
          ...this.entityLocations.values().map(({ x, y }) => hypotenuse(loc, { x, y }))
        )
      );
      const coordinates = candidateLocations.shift()!;
      let controller: UnitController;
      // TODO super hack!
      if (model.name === 'Goblin Archer') {
        controller = new ArcherController();
      } else {
        controller = new BasicEnemyController();
      }
      const unit = await state.getUnitFactory().createUnit({
        unitClass: model.id,
        controller,
        faction: Faction.ENEMY,
        coordinates,
        level: this.level,
        map
      });
      units.push(unit);
      enemiesRemaining--;
      this.entityLocations.add(coordinates);
    }
    return units;
  };

  private _generateObjects = async (
    state: GameState,
    map: MapInstance
  ): Promise<GameObject[]> => {
    const objects: GameObject[] = [];
    const candidateLocations = getUnoccupiedLocations(this.tiles, ['FLOOR'], []).filter(
      coordinates => !this.entityLocations.includes(coordinates)
    );

    const allEquipmentModels = await this.itemFactory.loadAllEquipmentModels();
    const allConsumableModels = await this.itemFactory.loadAllConsumableModels();
    let itemsRemaining = randInt(this.numItems.min, this.numItems.max);

    type ItemType = 'equipment' | 'consumable';
    type ItemSpec = Readonly<{
      type: ItemType;
      id: string;
    }>;

    const itemSpecs: ItemSpec[] = [];
    while (itemsRemaining > 0) {
      const possibleEquipmentModels = allEquipmentModels
        .filter(equipmentModel => {
          if (Feature.isEnabled(Feature.DEDUPLICATE_EQUIPMENT)) {
            return !state.getGeneratedEquipmentIds().includes(equipmentModel.id);
          }
          return true;
        })
        .filter(
          equipmentModel =>
            equipmentModel.level !== null && equipmentModel.level <= this.level
        );

      const possibleItemModels = allConsumableModels.filter(
        itemClass => itemClass.level !== null && itemClass.level <= this.level
      );

      const possibleItemSpecs: ItemSpec[] = [
        ...possibleEquipmentModels.map(model => ({
          type: 'equipment' as const,
          id: model.id
        })),
        ...possibleItemModels.map(model => ({
          type: 'consumable' as const,
          id: model.id
        }))
      ];

      checkState(possibleItemSpecs.length > 0);

      // weighted random
      const probabilities: Record<string, number> = {};
      const mappedObjects: Record<string, ItemSpec> = {};

      for (const itemSpec of possibleItemSpecs) {
        const key = `${itemSpec.type}_${itemSpec.id}`;
        const model = (() => {
          switch (itemSpec.type) {
            case 'equipment':
              return possibleEquipmentModels.find(
                equipmentModel => equipmentModel.id === itemSpec.id
              );
            case 'consumable':
              return possibleItemModels.find(itemClass => itemClass.id === itemSpec.id);
          }
        })();

        // Each rarity is 2x less common than the previous rarity.
        // So P[rarity] = 2 ^ -rarity
        probabilities[key] = 1 / 2 ** (model?.rarity ?? 0);
        mappedObjects[key] = itemSpec;
      }
      const chosenItemSpec = weightedRandom(probabilities, mappedObjects);
      itemSpecs.push(chosenItemSpec);
      if (chosenItemSpec.type === 'equipment') {
        state.recordEquipmentGenerated(chosenItemSpec.id);
      }
      itemsRemaining--;
    }

    for (const itemSpec of itemSpecs) {
      sortByReversed(candidateLocations, loc =>
        Math.min(
          ...this.entityLocations.values().map(({ x, y }) => hypotenuse(loc, { x, y }))
        )
      );
      const coordinates = checkNotNull(candidateLocations.shift());
      switch (itemSpec.type) {
        case 'equipment': {
          const equipment = await this.itemFactory.createMapEquipment(
            itemSpec.id,
            coordinates,
            map
          );

          objects.push(equipment);
          break;
        }
        case 'consumable': {
          const item = await this.itemFactory.createMapItem(
            itemSpec.id,
            coordinates,
            map
          );
          objects.push(item);
        }
      }
      itemsRemaining--;
      this.entityLocations.add(coordinates);
    }

    return objects;
  };
}
