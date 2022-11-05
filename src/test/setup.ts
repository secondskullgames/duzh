import UnitFactory from '../main/units/UnitFactory';
import GameState from '../main/core/GameState';
import MapInstance from '../main/maps/MapInstance';
import { initialize } from '../main/core/actions';
import { Renderer } from '../main/graphics/renderers/Renderer';

export const setup = async () => {
  const playerUnit = await UnitFactory.createPlayerUnit();
  const map = new MapInstance({
    width: 10,
    height: 0,
    tiles: [],
    doors: [],
    spawners: [],
    units: [],
    items: [],
    music: []
  });
  const state = new GameState({ playerUnit, maps: [() => Promise.resolve(map)] });
  const renderer: Renderer = {
    render: async () => {
      return null!; // lol
    }
  };
  await initialize(state, renderer);
};