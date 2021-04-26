import Sprite from './Sprite';
import Unit from '../../units/Unit';
import PlayerSprite from './units/PlayerSprite';
import GolemSprite from './units/GolemSprite';
import GruntSprite from './units/GruntSprite';
import SnakeSprite from './units/SnakeSprite';
import SoldierSprite from './units/SoldierSprite';
import { Direction, PaletteSwaps, SpriteSupplier } from '../../types/types';
import ArrowSprite from './projectiles/ArrowSprite';
import StaticSprite from './StaticSprite';

type UnitSpriteSupplier = (unit: Unit, paletteSwaps: PaletteSwaps) => Sprite;
type ProjectileSpriteSupplier = (direction: Direction, paletteSwaps: PaletteSwaps) => Sprite;

const StaticSprites: { [name: string]: SpriteSupplier } = {
  MAP_SWORD: paletteSwaps => new StaticSprite('sword_icon', { dx: 0, dy: -8 }, paletteSwaps),
  MAP_POTION: paletteSwaps => new StaticSprite('potion_icon', { dx: 0, dy: -8 }, paletteSwaps),
  MAP_SCROLL: paletteSwaps => new StaticSprite('scroll_icon', { dx: 0, dy: 0 }, paletteSwaps),
  MAP_BOW: paletteSwaps => new StaticSprite('bow_icon', { dx: 0, dy: 0 }, paletteSwaps)
};

const UnitSprites: { [name: string]: UnitSpriteSupplier } = {
  PLAYER: (unit: Unit, paletteSwaps: PaletteSwaps) => new PlayerSprite(unit, paletteSwaps),
  GOLEM: (unit: Unit, paletteSwaps: PaletteSwaps) => new GolemSprite(unit, paletteSwaps),
  GRUNT: (unit: Unit, paletteSwaps: PaletteSwaps) => new PlayerSprite(unit, paletteSwaps),
  SNAKE: (unit: Unit, paletteSwaps: PaletteSwaps) => new SnakeSprite(unit, paletteSwaps),
  SOLDIER: (unit: Unit, paletteSwaps: PaletteSwaps) => new PlayerSprite(unit, paletteSwaps)
};

const ProjectileSprites: { [name: string]: ProjectileSpriteSupplier } = {
  ARROW: (direction: Direction, paletteSwaps: PaletteSwaps) => new ArrowSprite(direction, paletteSwaps)
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
  SOLDIER: UnitSprites.SOLDIER,
  ARROW: ProjectileSprites.ARROW
};