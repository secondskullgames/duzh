import { MusicPlayer } from '@duzh/audio';
import { MapType } from '@duzh/models';
import { checkNotNull } from '@duzh/utils/preconditions';
import { updateRevealedTiles } from '@main/actions/updateRevealedTiles';
import { Game } from '@main/core/Game';
import MapInstance from '@main/maps/MapInstance';
import { SceneName } from '@main/scenes/SceneName';
import UnitFactory from '../units/UnitFactory';
import { GeneratedMapFactory } from './generated/GeneratedMapFactory';
import { MapHydrator } from './MapHydrator';
import { MapTemplate, PredefinedMapFactory } from '@duzh/maps';
import { AssetBundle } from '@duzh/models';

export interface MapController {
  loadFirstMap: (game: Game) => Promise<void>;
  loadNextMap: (game: Game) => Promise<void>;
  loadPreviousMap: (game: Game) => Promise<void>;
  loadDebugMap: (game: Game) => Promise<void>;
}

type Props = Readonly<{
  assetBundle: AssetBundle;
  predefinedMapFactory: PredefinedMapFactory;
  generatedMapFactory: GeneratedMapFactory;
  mapHydrator: MapHydrator;
  unitFactory: UnitFactory;
  musicPlayer: MusicPlayer;
}>;

export class MapControllerImpl implements MapController {
  private readonly assetBundle: AssetBundle;
  private readonly predefinedMapFactory: PredefinedMapFactory;
  private readonly generatedMapFactory: GeneratedMapFactory;
  private readonly mapHydrator: MapHydrator;
  private readonly unitFactory: UnitFactory;
  private readonly musicPlayer: MusicPlayer;

  constructor(props: Props) {
    this.assetBundle = props.assetBundle;
    this.predefinedMapFactory = props.predefinedMapFactory;
    this.generatedMapFactory = props.generatedMapFactory;
    this.mapHydrator = props.mapHydrator;
    this.unitFactory = props.unitFactory;
    this.musicPlayer = props.musicPlayer;
  }

  loadFirstMap = async (game: Game) => {
    const { unitFactory, musicPlayer, assetBundle } = this;
    const { state } = game;
    const map = await this._loadMap(assetBundle.maps[0].id, game);
    const playerUnit = await unitFactory.createPlayerUnit(
      map.getStartingCoordinates(),
      map
    );
    map.addUnit(playerUnit);
    state.addUnit(playerUnit);
    updateRevealedTiles(map, playerUnit);
    musicPlayer.stop();
    if (map.music) {
      musicPlayer.playMusic(map.music);
    }
  };

  loadNextMap = async (game: Game) => {
    const { musicPlayer, assetBundle } = this;
    const { state } = game;
    const currentMap = state.getPlayerUnit().getMap();
    musicPlayer.stop();
    const mapSpecs = assetBundle.maps;
    const nextMapIndex = mapSpecs.findIndex(spec => spec.id === currentMap.id) + 1;
    if (nextMapIndex >= mapSpecs.length) {
      state.endGameTimer();
      state.setScene(SceneName.VICTORY);
    } else {
      const map = await this._loadMap(mapSpecs[nextMapIndex].id, game);
      // TODO really need some bidirectional magic
      const playerUnit = state.getPlayerUnit();
      playerUnit.getMap().removeUnit(playerUnit);
      playerUnit.setCoordinates(map.getStartingCoordinates());
      playerUnit.setMap(map);
      map.addUnit(playerUnit);
      updateRevealedTiles(map, playerUnit);
      if (map.music) {
        musicPlayer.playMusic(map.music);
      }
    }
  };

  loadPreviousMap = async (game: Game) => {
    const { musicPlayer, assetBundle } = this;
    const { state } = game;
    const mapSpecs = assetBundle.maps;
    const playerUnit = state.getPlayerUnit();
    const currentMap = playerUnit.getMap();
    const previousMapIndex = mapSpecs.findIndex(spec => spec.id === currentMap.id) - 1;
    const map = await this._loadMap(mapSpecs[previousMapIndex].id, game);
    playerUnit.getMap().removeUnit(playerUnit);
    playerUnit.setMap(map);
    map.addUnit(playerUnit);
    playerUnit.setCoordinates(map.getStartingCoordinates());
    updateRevealedTiles(map, playerUnit);
    if (map.music) {
      musicPlayer.playMusic(map.music);
    }
  };

  loadDebugMap = async (game: Game) => {
    const { musicPlayer, predefinedMapFactory, mapHydrator, unitFactory } = this;
    const { state } = game;

    const mapTemplate = await predefinedMapFactory.buildPredefinedMap('test');
    const map = await mapHydrator.hydrateMap(mapTemplate, game);
    const playerUnit = await unitFactory.createPlayerUnit(
      map.getStartingCoordinates(),
      map
    );
    map.addUnit(playerUnit);
    state.addUnit(playerUnit);
    updateRevealedTiles(map, playerUnit);
    musicPlayer.stop();
    updateRevealedTiles(map, state.getPlayerUnit());
  };

  private _loadMap = async (mapId: string, game: Game): Promise<MapInstance> => {
    const { predefinedMapFactory, generatedMapFactory, mapHydrator, assetBundle } = this;
    const { state } = game;
    const mapSpecs = assetBundle.maps;
    const mapSpec = checkNotNull(mapSpecs.find(spec => spec.id === mapId));
    const id = mapSpec.id;
    if (!state.getMap(id)) {
      let template: MapTemplate;
      switch (mapSpec.type) {
        case MapType.PREDEFINED:
          template = await predefinedMapFactory.buildPredefinedMap(id);
          break;
        case MapType.GENERATED:
          template = await generatedMapFactory.buildGeneratedMap(id);
          break;
      }
      const map = await mapHydrator.hydrateMap(template, game);
      state.addMap(map);
    }
    return checkNotNull(state.getMap(id));
  };
}
