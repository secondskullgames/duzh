import ImageSupplier from '../ImageSupplier';
import Sprite from './Sprite';
import Colors from '../../types/Colors';
import Unit from '../../units/Unit';
import PlayerSprite from './PlayerSprite';
import GolemSprite from './GolemSprite';
import GruntSprite from './GruntSprite';
import SnakeSprite from './SnakeSprite';
import SoldierSprite from './SoldierSprite';
import { PaletteSwaps, SpriteSupplier } from '../../types/types';

const DEFAULT_SPRITE_KEY = 'default';

type UnitSpriteSupplier = (unit: Unit, paletteSwaps: PaletteSwaps) => Sprite;

function createStaticSprite(imageLoader: ImageSupplier, { dx, dy }: { dx: number, dy: number }): Sprite {
  return new Sprite({ [DEFAULT_SPRITE_KEY]: imageLoader }, DEFAULT_SPRITE_KEY, { dx, dy });
}

const StaticSprites: { [name: string]: SpriteSupplier } = {
  MAP_SWORD: (paletteSwaps) => createStaticSprite(new ImageSupplier('sword_icon', Colors.WHITE, paletteSwaps), { dx: 0, dy: -8 }),
  MAP_POTION: (paletteSwaps) => createStaticSprite(new ImageSupplier('potion_icon', Colors.WHITE, paletteSwaps), { dx: 0, dy: -8 }),
  MAP_SCROLL: (paletteSwaps) => createStaticSprite(new ImageSupplier('scroll_icon', Colors.WHITE, paletteSwaps), { dx: 0, dy: 0 }),
  MAP_BOW: (paletteSwaps) => createStaticSprite(new ImageSupplier('bow_icon', Colors.WHITE, paletteSwaps), { dx: 0, dy: 0 })
};

const UnitSprites: { [name: string]: UnitSpriteSupplier } = {
  PLAYER: (unit: Unit, paletteSwaps: PaletteSwaps) => new PlayerSprite(unit, paletteSwaps),
  GOLEM: (unit: Unit, paletteSwaps: PaletteSwaps) => new GolemSprite(unit, paletteSwaps),
  GRUNT: (unit: Unit, paletteSwaps: PaletteSwaps) => new GruntSprite(unit, paletteSwaps),
  SNAKE: (unit: Unit, paletteSwaps: PaletteSwaps) => new SnakeSprite(unit, paletteSwaps),
  SOLDIER: (unit: Unit, paletteSwaps: PaletteSwaps) => new SoldierSprite(unit, paletteSwaps)
};

// the following does not work: { ...StaticSprites, ...UnitSprites }
// :(
export default {
  MAP_SWORD: StaticSprites.MAP_SWORD,
  MAP_POTION: StaticSprites.MAP_POTION,
  MAP_SCROLL: StaticSprites.MAP_SCROLL,
  MAP_BOW: StaticSprites.MAP_BOW,
  PLAYER: UnitSprites.PLAYER,
  GOLEM: UnitSprites.GOLEM,
  GRUNT: UnitSprites.GRUNT,
  SNAKE: UnitSprites.SNAKE,
  SOLDIER: UnitSprites.SOLDIER
};

export { createStaticSprite };