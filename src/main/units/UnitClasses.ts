import grunt from '../../../data/units/grunt.json';
import player from '../../../data/units/player.json';
import snake from '../../../data/units/snake.json';
import soldier from '../../../data/units/soldier.json';
import golem from '../../../data/units/golem.json';
import UnitClass from './UnitClass';
import { UnitType } from '../types/types';
import Colors, { Color } from '../types/Colors';

function _mapPaletteSwaps(paletteSwaps: { [src: string]: Color }) {
  const map: { [src: string]: Color } = {};
  Object.entries(paletteSwaps).forEach(([src, dest]) => {
    const srcHex : string = Colors[src]!!;
    const destHex : string = Colors[dest]!!;
    map[srcHex] = destHex;
  });
  return map;
}

const PLAYER: UnitClass = _loadUnitClass(player);
const ENEMY_CLASSES: UnitClass[] = [grunt, golem, soldier, snake].map(json => _loadUnitClass(json));

function getEnemyClasses(): UnitClass[] {
  return ENEMY_CLASSES;
}

function _loadUnitClass(json: any): UnitClass {
  return {
    ...json,
    // We're using "friendly" color names, convert them to hex now
    paletteSwaps: _mapPaletteSwaps(json.paletteSwaps),
    // JSON parsing doesn't like indexed types, so just assume this is valid
    type: <UnitType>json.type
  };
}

export default {
  PLAYER,
  getEnemyClasses
};