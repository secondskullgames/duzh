import UnitClass from './UnitClass';
import Colors from '../types/Colors';
import { UnitType } from '../types/types';

const PLAYER: UnitClass = {
  name: 'PLAYER',
  type: UnitType.HUMAN,
  sprite: 'player',
  // Green/brown colors
  paletteSwaps: {
    [Colors.DARK_PURPLE]: Colors.DARK_BROWN, // Shirt
    [Colors.MAGENTA]: Colors.DARK_GREEN, // Upper Sleeves
    [Colors.DARK_BLUE]: Colors.DARK_GREEN, // Lower sleeves
    [Colors.CYAN]: Colors.LIGHT_PINK, // Hands
    [Colors.BLACK]: Colors.BLACK, // Belt
    [Colors.DARK_GRAY]: Colors.DARK_BROWN, // Skirt
    [Colors.LIGHT_GRAY]: Colors.LIGHT_BROWN, // Legs
    [Colors.DARK_GREEN]: Colors.DARK_BROWN, // Socks
    [Colors.GREEN]: Colors.DARK_BROWN, // Shoes
    [Colors.ORANGE]: Colors.LIGHT_PINK // Face
  },
  startingLife: 100,
  startingMana: 100,
  startingDamage: 10,
  minLevel: 1,
  maxLevel: 20,
  lifePerLevel: 10,
  manaPerLevel: 0,
  damagePerLevel: 1,
  experienceToNextLevel: [4, 6, 8, 10, 12, 14, 16, 18, 20]
};

const ENEMY_SNAKE: UnitClass = {
  name: 'ENEMY_SNAKE',
  type: UnitType.ANIMAL,
  sprite: 'snake',
  paletteSwaps: {},
  startingLife: 40,
  startingMana: null,
  startingDamage: 4,
  minLevel: 1,
  maxLevel: 2,
  lifePerLevel: 15,
  manaPerLevel: null,
  damagePerLevel: 1,
  aiParameters: {
    speed: 0.98,
    visionRange: 10,
    fleeThreshold: 0.2
  }
};

const ENEMY_GRUNT: UnitClass = {
  name: 'ENEMY_GRUNT',
  type: UnitType.HUMAN,
  sprite: 'player',
  paletteSwaps: {
    [Colors.DARK_GREEN]: Colors.DARK_BROWN, // Socks
    [Colors.GREEN]: Colors.DARK_BROWN, // Shoes
    [Colors.CYAN]: Colors.ORANGE // Hands
  },
  startingLife: 50,
  startingMana: null,
  startingDamage: 3,
  minLevel: 1,
  maxLevel: 4,
  lifePerLevel: 20,
  manaPerLevel: null,
  damagePerLevel: 1,
  equipment: [
    'BRONZE_CHAIN_MAIL',
    'IRON_HELMET',
    'BRONZE_SWORD'
  ],
  aiParameters: {
    speed: 0.95,
    visionRange: 8,
    fleeThreshold: 0.1
  }
};

const ENEMY_SOLDIER: UnitClass = {
  name: 'ENEMY_SOLDIER',
  type: UnitType.HUMAN,
  sprite: 'player',
  paletteSwaps: {
    [Colors.DARK_GREEN]: Colors.DARK_GRAY, // Socks
    [Colors.GREEN]: Colors.DARK_GRAY, // Shoes
    [Colors.CYAN]: Colors.ORANGE // Hands
  },
  startingLife: 60,
  startingMana: null,
  startingDamage: 4,
  minLevel: 3,
  maxLevel: 6,
  lifePerLevel: 20,
  manaPerLevel: null,
  damagePerLevel: 1,
  equipment: [
    'IRON_CHAIN_MAIL',
    'IRON_HELMET',
    'STEEL_SWORD'
  ],
  aiParameters: {
    speed: 0.95,
    visionRange: 10,
    fleeThreshold: 0.1
  }
};

const ENEMY_GOLEM: UnitClass = {
  name: 'ENEMY_GOLEM',
  type: UnitType.GOLEM,
  sprite: 'zombie',
  paletteSwaps: {
    [Colors.DARK_GRAY]: Colors.DARKER_GRAY,
    [Colors.LIGHT_GRAY]: Colors.DARKER_GRAY,
  },
  startingLife: 60,
  startingMana: null,
  startingDamage: 10,
  minLevel: 5,
  maxLevel: 9,
  lifePerLevel: 20,
  manaPerLevel: null,
  damagePerLevel: 1,
  aiParameters: {
    speed: 0.92,
    visionRange: 12,
    fleeThreshold: 0
  }
};

function getEnemyClasses() {
  return [ENEMY_SNAKE, ENEMY_GRUNT, ENEMY_SOLDIER, ENEMY_GOLEM];
}

export default {
  PLAYER,
  ENEMY_GRUNT,
  ENEMY_GOLEM,
  getEnemyClasses
};