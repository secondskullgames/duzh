import {
  ConsumableItemModel,
  DynamicSpriteModel,
  EquipmentModel,
  GeneratedMapModel,
  PredefinedMapModel,
  StaticSpriteModel,
  TileSetModel,
  UnitModel
} from '@duzh/models';
import { Image } from '@lib/graphics/images/Image';
import { checkNotNull } from '@lib/utils/preconditions';

/**
 * TODO: for now, this does not handle sound/music assets
 */
export interface AssetBundle {
  getEquipmentModel: (id: string) => EquipmentModel;
  getItemModel: (id: string) => ConsumableItemModel;
  getPredefinedMapModel: (id: string) => PredefinedMapModel;
  getGeneratedMapModel: (id: string) => GeneratedMapModel;
  getStaticSpriteModel: (id: string) => StaticSpriteModel;
  getDynamicSpriteModel: (id: string) => DynamicSpriteModel;
  getTileSetModel: (id: string) => TileSetModel;
  getUnitModel: (id: string) => UnitModel;

  getAllEquipmentModels: () => EquipmentModel[];
  getAllItemModels: () => ConsumableItemModel[];
  getAllUnitModels: () => UnitModel[];

  getImage: (path: string) => Image;
  getImageOptional: (path: string) => Image | null;
}

type Props = Readonly<{
  equipment: EquipmentModel[];
  items: ConsumableItemModel[];
  maps: Readonly<{
    predefined: PredefinedMapModel[];
    generated: GeneratedMapModel[];
  }>;
  sprites: Readonly<{
    static: StaticSpriteModel[];
    dynamic: DynamicSpriteModel[];
  }>;
  tileSets: TileSetModel[];
  units: UnitModel[];
  images: Record<string, Image>;
}>;

const arrayToRecord = <T extends { id: string }>(array: T[]): Record<string, T> => {
  return Object.fromEntries(array.map(t => [t.id, t]));
};

export class AssetBundleImpl implements AssetBundle {
  private readonly equipment: Record<string, EquipmentModel>;
  private readonly items: Record<string, ConsumableItemModel>;
  private readonly maps: Readonly<{
    predefined: Record<string, PredefinedMapModel>;
    generated: Record<string, GeneratedMapModel>;
  }>;
  private readonly sprites: Readonly<{
    static: Record<string, StaticSpriteModel>;
    dynamic: Record<string, DynamicSpriteModel>;
  }>;
  private readonly tileSets: Record<string, TileSetModel>;
  private readonly units: Record<string, UnitModel>;
  private readonly images: Record<string, Image>;

  constructor(props: Props) {
    this.equipment = arrayToRecord(props.equipment);
    this.items = arrayToRecord(props.items);
    this.maps = {
      predefined: arrayToRecord(props.maps.predefined),
      generated: arrayToRecord(props.maps.generated)
    };
    this.sprites = {
      static: arrayToRecord(props.sprites.static),
      dynamic: arrayToRecord(props.sprites.dynamic)
    };
    this.tileSets = arrayToRecord(props.tileSets);
    this.units = arrayToRecord(props.units);
    this.images = props.images;
  }

  getDynamicSpriteModel(id: string): DynamicSpriteModel {
    return checkNotNull(this.sprites.dynamic[id]);
  }

  getEquipmentModel(id: string): EquipmentModel {
    return checkNotNull(this.equipment[id]);
  }

  getGeneratedMapModel(id: string): GeneratedMapModel {
    return checkNotNull(this.maps.generated[id]);
  }

  getItemModel(id: string): ConsumableItemModel {
    return checkNotNull(this.items[id]);
  }

  getPredefinedMapModel(id: string): PredefinedMapModel {
    return checkNotNull(this.maps.predefined[id]);
  }

  getStaticSpriteModel(id: string): StaticSpriteModel {
    return checkNotNull(this.sprites.static[id]);
  }
  getTileSetModel(id: string): TileSetModel {
    return checkNotNull(this.tileSets[id]);
  }

  getUnitModel(id: string): UnitModel {
    return checkNotNull(this.units[id]);
  }

  getAllEquipmentModels(): EquipmentModel[] {
    return Object.values(this.equipment);
  }

  getAllItemModels(): ConsumableItemModel[] {
    return Object.values(this.items);
  }

  getAllUnitModels(): UnitModel[] {
    return Object.values(this.units);
  }

  getImage(path: string): Image {
    return checkNotNull(this.images[path]);
  }

  getImageOptional(path: string): Image | null {
    return this.images[path] ?? null;
  }
}
