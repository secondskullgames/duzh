import { GameDriver } from '../main/core/GameDriver';
import GameRenderer from '../main/graphics/renderers/GameRenderer';
import UnitFactory from '../main/entities/units/UnitFactory';
import GameState from '../main/core/GameState';
import MapInstance from '../main/maps/MapInstance';
import { Renderer } from '../main/graphics/renderers/Renderer';
import { GameEngine } from '../main/core/GameEngine';
import ItemService from '../main/items/ItemService';
import SpriteFactory from '../main/graphics/sprites/SpriteFactory';
import ImageFactory from '../main/graphics/images/ImageFactory';
import ProjectileFactory from '../main/entities/objects/ProjectileFactory';
import AnimationFactory from '../main/graphics/animations/AnimationFactory';

export const setup = async () => {
  const playerUnit = await UnitFactory.getInstance().createPlayerUnit();
  const map = new MapInstance({
    width: 10,
    height: 0,
    tiles: [],
    units: [],
    objects: [],
    music: []
  });
  const state = new GameState();
  const renderer: Renderer = {
    render: async () => {
      return null!; // lol
    }
  };
  const engine = new GameEngine({ state, renderer });
  GameEngine.setInstance(engine);
  const spriteFactory = new SpriteFactory({ imageFactory: new ImageFactory() });
  SpriteFactory.setInstance(spriteFactory);
  const projectileFactory = new ProjectileFactory({ spriteFactory });
  const animationFactory = new AnimationFactory({ state, projectileFactory });
  AnimationFactory.setInstance(animationFactory);
  const itemService = new ItemService({ state, engine, spriteFactory, animationFactory });
  ItemService.setInstance(itemService);
  const unitFactory = new UnitFactory({ itemService, spriteFactory });
  UnitFactory.setInstance(unitFactory);
  state.setPlayerUnit(playerUnit);
  state.addMaps([() => Promise.resolve(map)]);
  const driver = new GameDriver({
    state,
    renderer: renderer as GameRenderer,
    engine
  });
  GameDriver.setInstance(driver);
};
