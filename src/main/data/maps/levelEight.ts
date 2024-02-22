import PredefinedMapModel from '../../schemas/PredefinedMapModel';

export default (): PredefinedMapModel => ({
  imageFilename: '8',
  tileset: 'dungeon',
  levelNumber: 8,
  tileColors: {
    BLACK: 'FLOOR',
    DARK_GRAY: 'WALL',
    LIGHT_GRAY: 'WALL_TOP',
    GREEN: 'STAIRS_DOWN',
    DARK_GREEN: 'FLOOR',
    DARK_BLUE: 'FLOOR',
    DARK_RED: 'FLOOR',
    DARK_YELLOW: 'FLOOR',
    YELLOW: 'FLOOR',
    DARK_BROWN: 'FLOOR',
    CYAN: 'FLOOR',
    BLUE: 'FLOOR'
  },
  defaultTile: 'FLOOR',
  enemyColors: {
    DARK_GREEN: 'goblin_soldier',
    DARK_BLUE: 'golem'
  },
  itemColors: {
    DARK_RED: 'life_potion',
    DARK_YELLOW: 'floor_fire_scroll',
    YELLOW: 'key'
  },
  equipmentColors: {},
  objectColors: {
    DARK_BROWN: 'door_vertical',
    CYAN: 'mirror'
  },
  startingPointColor: 'BLUE',
  fogOfWar: {
    enabled: true,
    radius: 3
  }
});
