import {
  ConsumableItemModel,
  DynamicSpriteModel,
  EquipmentModel,
  GeneratedMapModel,
  MapSpec,
  MusicModel,
  PredefinedMapModel,
  SoundEffect,
  StaticSpriteModel,
  TileSetModel,
  UnitModel
} from '@duzh/models';
import { checkNotNull } from '@duzh/utils/preconditions';
import { Color } from '@lib/graphics/Color';

export interface AssetBundle {
  getEquipmentModel: (id: string) => EquipmentModel;
  getItemModel: (id: string) => ConsumableItemModel;
  getPredefinedMapModel: (id: string) => PredefinedMapModel;
  getGeneratedMapModel: (id: string) => GeneratedMapModel;
  getStaticSpriteModel: (id: string) => StaticSpriteModel;
  getDynamicSpriteModel: (id: string) => DynamicSpriteModel;
  getTileSetModel: (id: string) => TileSetModel;
  getUnitModel: (id: string) => UnitModel;
  getSoundModel: (id: string) => SoundEffect;
  getMusicModel: (id: string) => MusicModel;

  getAllEquipmentModels: () => EquipmentModel[];
  getAllItemModels: () => ConsumableItemModel[];
  getAllUnitModels: () => UnitModel[];

  colorForName: (name: string) => Color;
  getMapList: () => MapSpec[];
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
  sounds: SoundEffect[];
  music: MusicModel[];
  colors: Record<string, Color>;
  mapList: MapSpec[];
}>;

const mapById = <T extends { id: string }>(array: T[]): Record<string, T> => {
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
  private readonly sounds: Record<string, SoundEffect>;
  private readonly music: Record<string, MusicModel>;
  private readonly colors: Record<string, Color>;
  private readonly mapList: MapSpec[];

  constructor(props: Props) {
    this.equipment = mapById(props.equipment);
    this.items = mapById(props.items);
    this.maps = {
      predefined: mapById(props.maps.predefined),
      generated: mapById(props.maps.generated)
    };
    this.sprites = {
      static: mapById(props.sprites.static),
      dynamic: mapById(props.sprites.dynamic)
    };
    this.tileSets = mapById(props.tileSets);
    this.units = mapById(props.units);
    this.sounds = mapById(props.sounds);
    this.music = mapById(props.music);
    this.colors = props.colors;
    this.mapList = props.mapList;
  }

  getDynamicSpriteModel = (id: string): DynamicSpriteModel =>
    checkNotNull(this.sprites.dynamic[id]);

  getEquipmentModel = (id: string): EquipmentModel => checkNotNull(this.equipment[id]);

  getGeneratedMapModel = (id: string): GeneratedMapModel =>
    checkNotNull(this.maps.generated[id]);

  getItemModel = (id: string): ConsumableItemModel => checkNotNull(this.items[id]);

  getPredefinedMapModel = (id: string): PredefinedMapModel => {
    return checkNotNull(this.maps.predefined[id]);
  };

  getStaticSpriteModel = (id: string): StaticSpriteModel => {
    return checkNotNull(this.sprites.static[id]);
  };
  getTileSetModel = (id: string): TileSetModel => {
    return checkNotNull(this.tileSets[id]);
  };

  getUnitModel = (id: string): UnitModel => {
    return checkNotNull(this.units[id]);
  };

  getSoundModel = (id: string): SoundEffect => {
    return checkNotNull(this.sounds[id]);
  };

  getMusicModel = (id: string): MusicModel => {
    return checkNotNull(this.music[id]);
  };

  getAllEquipmentModels = (): EquipmentModel[] => {
    return Object.values(this.equipment);
  };

  getAllItemModels = (): ConsumableItemModel[] => {
    return Object.values(this.items);
  };

  getAllUnitModels = (): UnitModel[] => {
    return Object.values(this.units);
  };

  colorForName = (name: string): Color => checkNotNull(this.colors[name]);
  getMapList = (): MapSpec[] => this.mapList;
}
