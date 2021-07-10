import bronze_sword from '../../../../data/equipment/bronze_sword.json';
import iron_sword from '../../../../data/equipment/iron_sword.json';
import steel_sword from '../../../../data/equipment/steel_sword.json';
import fire_sword from '../../../../data/equipment/fire_sword.json';
import short_bow from '../../../../data/equipment/short_bow.json';
import long_bow from '../../../../data/equipment/long_bow.json';
import bronze_chain_mail from '../../../../data/equipment/bronze_chain_mail.json';
import iron_chain_mail from '../../../../data/equipment/iron_chain_mail.json';
import iron_helmet from '../../../../data/equipment/iron_helmet.json';
import PaletteSwaps from '../../types/PaletteSwaps';
import { EquipmentSlot, ItemCategory } from '../../types/types';

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
    paletteSwaps: PaletteSwaps.create(json.paletteSwaps),
  };
}

const _map: Record<string, EquipmentClass> = {
  bronze_sword: _load(bronze_sword),
  iron_sword: _load(iron_sword),
  steel_sword: _load(steel_sword),
  fire_sword: _load(fire_sword),
  short_bow: _load(short_bow),
  long_bow: _load(long_bow),
  bronze_chain_mail: _load(bronze_chain_mail),
  iron_chain_mail: _load(iron_chain_mail),
  iron_helmet: _load(iron_helmet)
};

namespace EquipmentClass {
  export const forName = (name: string): EquipmentClass => {
    if (_map.hasOwnProperty(name)) {
      return _load(_map[name]);
    }
    throw `Unknown equipment "${name}"!`;
  }

  export const values = (): EquipmentClass[] => Object.values(_map);
}

export default EquipmentClass;
