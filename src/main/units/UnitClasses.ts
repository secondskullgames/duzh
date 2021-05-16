import grunt from '../../../data/units/grunt.json';
import player from '../../../data/units/player.json';
import snake from '../../../data/units/snake.json';
import soldier from '../../../data/units/soldier.json';
import golem from '../../../data/units/golem.json';
import UnitClass from './UnitClass';
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

const PLAYER: UnitClass = _load(player);
const ENEMY_CLASSES: UnitClass[] = [grunt, golem, soldier, snake].map(json => _load(json));

function getEnemyClasses(): UnitClass[] {
  return ENEMY_CLASSES;
}

function _load(json: any): UnitClass {
  return <UnitClass>{
    ...json,
    // We're using "friendly" color names, convert them to hex now
    paletteSwaps: _mapPaletteSwaps(json.paletteSwaps),
  };
}

export default {
  PLAYER,
  getEnemyClasses
};