import { GameDriver } from '../main/core/GameDriver';
import GameRenderer from '../main/graphics/renderers/GameRenderer';
import UnitFactory from '../main/units/UnitFactory';
import GameState from '../main/core/GameState';
import MapInstance from '../main/maps/MapInstance';
import { Renderer } from '../main/graphics/renderers/Renderer';
import { GameEngine } from '../main/core/GameEngine';
import ItemFactory from '../main/items/ItemFactory';

export const setup = async () => {
  const playerUnit = await UnitFactory.getInstance().createPlayerUnit();
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
  const state = new GameState();
  const renderer: Renderer = {
    render: async () => {
      return null!; // lol
    }
  };
  const engine = new GameEngine({ state, renderer });
  const itemFactory = new ItemFactory({ state, engine });
  const unitFactory = new UnitFactory({ itemFactory });
  state.setPlayerUnit(playerUnit);
  state.addMaps([() => Promise.resolve(map)]);
  const driver = new GameDriver({
    state,
    renderer: renderer as GameRenderer,
    engine
  });
};
