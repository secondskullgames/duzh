import PredefinedMapModel from '../../schemas/PredefinedMapModel';

export default (): PredefinedMapModel => ({
  imageFilename: '7',
  tileset: 'dungeon',
  levelNumber: 7,
  tileColors: {
    BLACK: 'FLOOR',
    DARK_GRAY: 'WALL',
    LIGHT_GRAY: 'WALL_TOP',
    GREEN: 'STAIRS_DOWN',
    DARK_BROWN: 'FLOOR',
    BLUE: 'FLOOR',
    RED: 'FLOOR'
  },
  defaultTile: 'FLOOR',
  enemyColors: {
    RED: 'robed_wizard'
  },
  itemColors: {},
  equipmentColors: {},
  objectColors: {
    DARK_BROWN: 'door_vertical'
  },
  startingPointColor: 'BLUE',
  fogOfWar: {
    enabled: false
  }
});
