import UnitFactory from '../main/units/UnitFactory';
import GameState from '../main/core/GameState';
import MapInstance from '../main/maps/MapInstance';

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

  GameState.setInstance(state);
};