import Sprite from './Sprite';
import Unit from '../../units/Unit';
import { Direction, PaletteSwaps } from '../../types/types';
import StaticSprite from './StaticSprite';
import UnitSprite from './UnitSprite';
import ProjectileSprite from './ProjectileSprite';
import Equipment from '../../items/equipment/Equipment';
import EquipmentSprite from './EquipmentSprite';
import { SpriteConfigs } from './SpriteConfig';
import { StaticSpriteConfigs } from './StaticSpriteConfig';

type ProjectileSpriteSupplier = (direction: Direction, paletteSwaps: PaletteSwaps) => Sprite;

function createStaticSprite(spriteName: string, paletteSwaps: PaletteSwaps={}) {
  const spriteConfig = StaticSpriteConfigs[spriteName]!!;
  return new StaticSprite(spriteConfig, paletteSwaps);
}

function createUnitSprite(spriteName: string, unit: Unit, paletteSwaps: PaletteSwaps={}) {
  const spriteConfig = SpriteConfigs[spriteName]!!;
  return new UnitSprite(spriteConfig, unit, paletteSwaps);
}

function createEquipmentSprite(spriteName: string, equipment: Equipment, paletteSwaps: PaletteSwaps={}) {
  const spriteConfig = SpriteConfigs[spriteName]!!;
  return new EquipmentSprite(spriteConfig, equipment, paletteSwaps);
}

const ProjectileSprites: { [name: string]: ProjectileSpriteSupplier } = {
  ARROW: (direction: Direction, paletteSwaps: PaletteSwaps) => new ProjectileSprite(direction, 'arrow', paletteSwaps, { dx: 0, dy: -8 })
};

// the following does not work: { ...StaticSprites, ...UnitSprites }
// :(
export default {
  ARROW: ProjectileSprites.ARROW,
  createStaticSprite,
  createUnitSprite,
  createEquipmentSprite
};