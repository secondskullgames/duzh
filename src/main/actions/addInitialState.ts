import GameState from '../core/GameState';
import UnitFactory from '../entities/units/UnitFactory';
import ImageFactory from '../graphics/images/ImageFactory';
import MapSpec from '../schemas/MapSpec';
import { MapSupplier } from '../maps/MapSupplier';
import MapFactory from '../maps/MapFactory';

type Context = Readonly<{
  state: GameState,
  imageFactory: ImageFactory
}>;

export const addInitialState = async ({ state, imageFactory }: Context) => {
  const playerUnit = await UnitFactory.createPlayerUnit({
    imageFactory
  });
  state.setPlayerUnit(playerUnit);
  const mapSpecs = (await import(
    /* webpackChunkName: "models" */
    `../../../data/maps.json`
    )).default as MapSpec[];
  const maps: MapSupplier[] = mapSpecs.map(spec => {
    return () => MapFactory.loadMap(spec, {
      state,
      imageFactory
    });
  });
  state.addMaps(maps);
};