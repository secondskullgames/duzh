import GameState from '../../core/GameState';
import Coordinates from '../../geometry/Coordinates';
import { CustomSet } from '../../types/CustomSet';
import ItemFactory from '../../items/ItemFactory';
import Tile from '../../tiles/Tile';
import Unit from '../../entities/units/Unit';
import UnitFactory from '../../entities/units/UnitFactory';
import { sortByReversed } from '../../utils/arrays';
import { randChoice, randInt, weightedRandom } from '../../utils/random';
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

type Props = Readonly<{
  level: number;
  width: number;
  height: number;
  tiles: Tile[][];
  enemies: Range;
  items: Range;
}>;

type Context = Readonly<{
  state: GameState;
  imageFactory: ImageFactory;
}>;

export default class GeneratedMapBuilder {
  private readonly level: number;
  private readonly width: number;
  private readonly height: number;
  private readonly tiles: Tile[][];
  private readonly numEnemies: Range;
  private readonly numItems: Range;
  private readonly entityLocations: CustomSet<Coordinates>;

  constructor({ level, width, height, tiles, enemies, items }: Props) {
    this.level = level;
    this.width = width;
    this.height = height;
    this.tiles = tiles;
    this.numEnemies = enemies;
    this.numItems = items;
    this.entityLocations = new CustomSet();
  }

  build = async ({ state, imageFactory }: Context): Promise<MapInstance> => {
    const candidateLocations = getUnoccupiedLocations(this.tiles, ['FLOOR'], []);
    const playerUnit = state.getPlayerUnit();
    const playerUnitCoordinates = checkNotNull(candidateLocations.shift());
    playerUnit.setCoordinates(playerUnitCoordinates);
    this.entityLocations.add(playerUnitCoordinates);
    const units = [playerUnit, ...(await this._generateUnits({ state, imageFactory }))];
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

  _generateUnits = async ({ imageFactory }: Context): Promise<Unit[]> => {
    const units: Unit[] = [];
    const candidateLocations = getUnoccupiedLocations(this.tiles, ['FLOOR'], []).filter(
      coordinates => !this.entityLocations.includes(coordinates)
    );
    let enemiesRemaining = randInt(this.numEnemies.min, this.numEnemies.max);

    const allUnitModels = await UnitFactory.loadAllModels();
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

      // TODO: weighted random, favoring higher-level units
      const model = randChoice(possibleUnitModels);
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
      const unit = await UnitFactory.createUnit(
        {
          unitClass: model.id,
          controller,
          faction: Faction.ENEMY,
          coordinates,
          level: this.level
        },
        {
          imageFactory
        }
      );
      units.push(unit);
      enemiesRemaining--;
      this.entityLocations.add(coordinates);
    }
    return units;
  };

  private _generateObjects = async ({
    state,
    imageFactory
  }: Context): Promise<GameObject[]> => {
    const objects: GameObject[] = [];
    const candidateLocations = getUnoccupiedLocations(this.tiles, ['FLOOR'], []).filter(
      coordinates => !this.entityLocations.includes(coordinates)
    );

    const allEquipmentModels = await ItemFactory.loadAllEquipmentModels();
    const allConsumableModels = await ItemFactory.loadAllConsumableModels();
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
      console.log(
        `chose item ${JSON.stringify(chosenItemSpec)} weights=${JSON.stringify(
          probabilities
        )}`
      );
      itemSpecs.push(chosenItemSpec);
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
          const equipment = await ItemFactory.createMapEquipment(
            itemSpec.id,
            coordinates,
            {
              imageFactory
            }
          );

          objects.push(equipment);
          state.recordEquipmentGenerated(itemSpec.id);
          break;
        }
        case 'consumable': {
          const item = await ItemFactory.createMapItem(itemSpec.id, coordinates, {
            imageFactory
          });
          objects.push(item);
        }
      }
      itemsRemaining--;
      this.entityLocations.add(coordinates);
    }

    return objects;
  };
}
