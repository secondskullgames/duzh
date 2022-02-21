import TileType from '../../../tiles/TileType';
import Section from './Section';

interface TileGenerator {
  generateTiles: (section: Section) => TileType[][];
}

const createTileGenerator = () => {
  const _generateFloorTiles = (section: Section): TileType[][] => {
    const tiles: TileType[][] = [];
    for (let y = 0; y < section.getHeight(); y++) {
      const row: TileType[] = [];
      tiles.push(row);
      for (let x = 0; x < section.getWidth(); x++) {
        row.push('NONE');
      }
    }

    const allSections = section.getAllSubsections();
    allSections.push(section);
    for (const s of allSections) {
      if (s.room !== null) {
        const { left, top, width, height } = s.room;
        for (let y = top; y < top + height; y++) {
          for (let x = left; x < left + width; x++) {
            tiles[y][x] = 'FLOOR';
          }
        }
      }

      if (s.connection !== null) {
        for (const { x, y } of s.connection.connectedCoordinates) {
          tiles[y][x] = 'FLOOR_HALL';
        }
      }
    }
    return tiles;
  };

  const _addWallTiles = (tiles: TileType[][]) => {
    const height = tiles.length;
    const width = tiles[0].length;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tileType = tiles[y][x];
        switch (tileType) {
          case 'FLOOR':
          case 'FLOOR_HALL':
            if (y >= 1) {
              if (tiles[y - 1][x] === 'NONE') {
                tiles[y - 1][x] = (tileType === 'FLOOR_HALL') ? 'WALL_HALL' : 'WALL';
              }
              if (y >= 2) {
                if (tiles[y - 2][x] === 'NONE') {
                  tiles[y - 2][x] = 'WALL_TOP';
                }
              }
            }
        }
      }
    }
  };

  const generateTiles = (section: Section): TileType[][] => {
    const tiles = _generateFloorTiles(section);
    _addWallTiles(tiles);
    return tiles;
  };

  return { generateTiles };
};

namespace TileGenerator {
  export const create = createTileGenerator;
}

export default TileGenerator;
