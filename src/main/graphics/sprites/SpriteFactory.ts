import Sprite from './Sprite';
import Unit from '../../units/Unit';
import { Direction, PaletteSwaps, SpriteSupplier } from '../../types/types';
import StaticSprite from './StaticSprite';
import UnitSprite from './UnitSprite';
import ProjectileSprite from './ProjectileSprite';
import Equipment from '../../items/equipment/Equipment';
import EquipmentSprite from './EquipmentSprite';
import { SpriteConfigs } from './SpriteConfig';

type UnitSpriteSupplier = (unit: Unit, paletteSwaps: PaletteSwaps) => Sprite;
type EquipmentSpriteSupplier = (equipment: Equipment, paletteSwaps: PaletteSwaps) => Sprite;
type ProjectileSpriteSupplier = (direction: Direction, paletteSwaps: PaletteSwaps) => Sprite;

const StaticSprites: { [name: string]: SpriteSupplier } = {
  MAP_SWORD: paletteSwaps  => new StaticSprite('equipment/sword/sword_icon_small', { dx: 8, dy: 0 }, paletteSwaps),
  MAP_POTION: paletteSwaps => new StaticSprite('potion_icon', { dx: 0, dy: -8 }, paletteSwaps),
  MAP_SCROLL: paletteSwaps => new StaticSprite('scroll_icon', { dx: 0, dy: 0 }, paletteSwaps),
  MAP_BOW: paletteSwaps    => new StaticSprite('bow_icon', { dx: 0, dy: 0 }, paletteSwaps),
  MAP_MAIL: paletteSwaps   => new StaticSprite('equipment/mail/mail_icon_small', { dx: 8, dy: 0 }, paletteSwaps)
};

const UnitSprites: { [name: string]: UnitSpriteSupplier } = {
  PLAYER: (unit: Unit, paletteSwaps: PaletteSwaps) => new UnitSprite(unit, SpriteConfigs.PLAYER, paletteSwaps, { dx: -4, dy: -20 }),
  GOLEM: (unit: Unit, paletteSwaps: PaletteSwaps) => new UnitSprite(unit, SpriteConfigs.ZOMBIE, paletteSwaps, { dx: -4, dy: -20 }),
  GRUNT: (unit: Unit, paletteSwaps: PaletteSwaps) => new UnitSprite(unit, SpriteConfigs.PLAYER, paletteSwaps, { dx: -4, dy: -20 }),
  SNAKE: (unit: Unit, paletteSwaps: PaletteSwaps) => new UnitSprite(unit, SpriteConfigs.SNAKE, paletteSwaps, { dx: 0, dy: 0 }),
  SOLDIER: (unit: Unit, paletteSwaps: PaletteSwaps) => new UnitSprite(unit, SpriteConfigs.PLAYER, paletteSwaps, { dx: -4, dy: -20 }),
};

// TODO - check offsets
const EquipmentSprites: { [name: string]: EquipmentSpriteSupplier } = {
  SWORD: (equipment: Equipment, paletteSwaps: PaletteSwaps) => new EquipmentSprite(equipment, SpriteConfigs.SWORD, paletteSwaps, { dx: -4, dy: -20 }),
  BOW: (equipment: Equipment, paletteSwaps: PaletteSwaps) => new EquipmentSprite(equipment, SpriteConfigs.BOW, paletteSwaps, { dx: -4, dy: -20 }),
  MAIL: (equipment: Equipment, paletteSwaps: PaletteSwaps) => new EquipmentSprite(equipment, SpriteConfigs.MAIL, paletteSwaps, { dx: -4, dy: -20 })
}

const ProjectileSprites: { [name: string]: ProjectileSpriteSupplier } = {
  ARROW: (direction: Direction, paletteSwaps: PaletteSwaps) => new ProjectileSprite(direction, 'arrow', paletteSwaps, { dx: 0, dy: -8 })
};

// the following does not work: { ...StaticSprites, ...UnitSprites }
// :(
export default {
  MAP_SWORD: StaticSprites.MAP_SWORD,
  MAP_POTION: StaticSprites.MAP_POTION,
  MAP_SCROLL: StaticSprites.MAP_SCROLL,
  MAP_BOW: StaticSprites.MAP_BOW,
  MAP_MAIL: StaticSprites.MAP_MAIL,
  PLAYER: UnitSprites.PLAYER,
  GOLEM: UnitSprites.GOLEM,
  GRUNT: UnitSprites.GRUNT,
  SNAKE: UnitSprites.SNAKE,
  SOLDIER: UnitSprites.SOLDIER,
  SWORD: EquipmentSprites.SWORD,
  BOW: EquipmentSprites.BOW,
  ARROW: ProjectileSprites.ARROW,
  MAIL: EquipmentSprites.MAIL
};

export type {
  EquipmentSpriteSupplier
};