import DynamicSpriteModel from './DynamicSpriteModel';

const staticSpriteNames = [
  'map_bow',
  'map_helmet',
  'map_mail',
  'map_potion',
  'map_scroll',
  'map_sword'
];

const dynamicSpriteNames = [
  'bow',
  'helmet',
  'mail',
  'player',
  'shield2',
  'snake',
  'sword',
  'zombie'
];

class SpriteStore {
  private readonly _store: Record<string, DynamicSpriteModel>;

  constructor() {
     this._store = {};
  }

  init = async () => {
    for (const spriteName of dynamicSpriteNames) {
      const spriteModel: DynamicSpriteModel = (await import(`../../../../data/sprites/equipment/${spriteName}.json`)).default;
      this._store[spriteName] = spriteModel;
    }
  };
}

export default SpriteStore;

