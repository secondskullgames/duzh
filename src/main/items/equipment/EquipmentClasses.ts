import bronze_sword from '../../../../data/equipment/bronze_sword.json';
import iron_sword from '../../../../data/equipment/iron_sword.json';
import steel_sword from '../../../../data/equipment/steel_sword.json';
import fire_sword from '../../../../data/equipment/fire_sword.json';
import short_bow from '../../../../data/equipment/short_bow.json';
import long_bow from '../../../../data/equipment/long_bow.json';
import bronze_chain_mail from '../../../../data/equipment/bronze_chain_mail.json';
import iron_chain_mail from '../../../../data/equipment/iron_chain_mail.json';
import iron_helmet from '../../../../data/equipment/iron_helmet.json';
import { EquipmentSlot, ItemCategory, PaletteSwaps } from '../../types/types';
import Colors, { Color } from '../../types/Colors';
import UnitClasses from '../../units/UnitClasses';

interface EquipmentClass {
  readonly name: string,
  readonly sprite: string,
  readonly mapIcon: string,
  readonly itemCategory: ItemCategory,
  readonly slot: EquipmentSlot,
  readonly char: string,
  readonly paletteSwaps: PaletteSwaps,
  readonly damage?: number,
  // TODO move these somewhere else - just used to control item spawns
  readonly minLevel: number,
  readonly maxLevel: number,
}

function _load(json: any): EquipmentClass {
  // ugh
  return {
    ...json,
    // We're using "friendly" color names, convert them to hex now
    paletteSwaps: _mapPaletteSwaps(json.paletteSwaps),
  };
}

/**
 * TODO copy-pasted from {@link UnitClasses}
 */
function _mapPaletteSwaps(paletteSwaps: { [src: string]: Color }) {
  const map: { [src: string]: Color } = {};
  Object.entries(paletteSwaps).forEach(([src, dest]) => {
    const srcHex : string = Colors[src]!!;
    const destHex : string = Colors[dest]!!;
    map[srcHex] = destHex;
  });
  return map;
}

const EquipmentClasses: { [name: string]: EquipmentClass } = {
  bronze_sword: _load(bronze_sword),
  iron_sword: _load(iron_sword),
  steel_sword: _load(steel_sword),
  fire_sword: _load(fire_sword),
  short_bow: _load(short_bow),
  long_bow: _load(long_bow),
  bronze_chain_mail: _load(bronze_chain_mail),
  iron_chain_mail: _load(iron_chain_mail),
  iron_helmet: _load(iron_helmet)
}

export {
  EquipmentClass,
  EquipmentClasses
};