import { ItemOrEquipment, ObjectTemplate } from '@main/maps/MapTemplate';
import { Feature } from '@duzh/features';
import { checkState } from '@duzh/utils/preconditions';
import { weightedRandom, WeightedRandomChoice } from '@duzh/utils/random';
import { AssetBundle } from '@duzh/models';

type Props = Readonly<{
  assetBundle: AssetBundle;
}>;

/**
 * TODO - currently this doesn't handle actual instantiation of items,
 * just choosing them
 */
export class ItemController {
  private readonly assetBundle: AssetBundle;
  private readonly generatedEquipmentIds: Set<string>;

  constructor(props: Props) {
    this.assetBundle = props.assetBundle;
    this.generatedEquipmentIds = new Set<string>();
  }

  chooseRandomMapItemForLevel = async (levelNumber: number): Promise<ItemOrEquipment> => {
    // TODO: this is a hack to force a bronze sword on the first level
    // I don't want to design a better DSL for map generation right now
    if (
      Feature.isEnabled(Feature.FORCE_BRONZE_SWORD) &&
      levelNumber === 1 &&
      !this.generatedEquipmentIds.has('bronze_sword')
    ) {
      const equipmentModel = this.assetBundle.equipment['bronze_sword'];
      const object: ObjectTemplate = { type: 'equipment', model: equipmentModel };
      this.generatedEquipmentIds.add('bronze_sword');
      return object;
    }

    const allEquipmentModels = Object.values(this.assetBundle.equipment);
    const allConsumableModels = Object.values(this.assetBundle.items);
    const possibleEquipmentModels = allEquipmentModels
      .filter(equipmentModel => {
        if (Feature.isEnabled(Feature.DEDUPLICATE_EQUIPMENT)) {
          return !this.generatedEquipmentIds.has(equipmentModel.id);
        }
        return true;
      })
      .filter(
        equipmentModel => equipmentModel.level && equipmentModel.level <= levelNumber
      );

    const possibleItemModels = allConsumableModels.filter(
      itemModel => itemModel.level && itemModel.level <= levelNumber
    );

    const possibleObjects: ItemOrEquipment[] = [
      ...possibleEquipmentModels.map(model => ({ type: 'equipment' as const, model })),
      ...possibleItemModels.map(model => ({ type: 'item' as const, model }))
    ];

    checkState(possibleObjects.length > 0);

    // weighted random
    const choices: WeightedRandomChoice<ItemOrEquipment>[] = [];

    for (let i = 0; i < possibleObjects.length; i++) {
      const object = possibleObjects[i];
      const key = `${i}`;
      const { model } = object;
      // Each rarity is 2x less common than the previous rarity.
      // So P[rarity] = 2 ^ -rarity
      const weight = 0.5 ** (model?.rarity ?? 0);
      choices.push({ weight, key, value: object });
    }
    const object = weightedRandom(choices);
    if (object.type === 'equipment') {
      this.generatedEquipmentIds.add(object.model.id);
    }
    return object;
  };
}
