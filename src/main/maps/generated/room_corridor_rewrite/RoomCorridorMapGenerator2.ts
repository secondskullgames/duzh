import Rect from '../../../geometry/Rect';
import TileSet from '../../../tiles/TileSet';
import TileType from '../../../tiles/TileType';
import AbstractMapGenerator from '../AbstractMapGenerator';
import EmptyMap from '../EmptyMap';
import Section from './Section';
import SectionConnector from './SectionConnector';
import SectionSplitter from './SectionSplitter';
import TileGenerator from './TileGenerator';

const MIN_ROOM_WIDTH = 4;
const MIN_ROOM_HEIGHT = 4;
const HORIZONTAL_SECTION_PADDING = 2;
const VERTICAL_SECTION_PADDING = 2;

/**
 * This class generates randomized room-and-corridor levels similar to those used in Rogue and other classic
 * roguelikes.
 *
 * The general strategy is:
 *
 * recursively split the map into sections
 * add rooms to sections that can't be split up further
 * add connections between each pair of sections, between any rooms that are close enough
 *
 * Note that this was ported from a previous Java implementation and may not be idiomatic Typescript.
 */
class RoomCorridorMapGenerator2 extends AbstractMapGenerator {
  // The following ASCII diagram looks horrible but is necessary to explain how section sizing works.
  // Section dimensions are calculated as the sum of room dimensions, two sets of padding, and an extra
  // row/column for section boundaries.
  //
  //    +--------+
  //    |        |
  //    |        |
  //    |  ####  |
  //    |  ####  |
  //    |  ####  |
  //    |  ####  |
  //    |        |
  //    |        |
  //    +--------+

  constructor(tileSet: TileSet) {
    super(tileSet);
  }

  /**
   * @override
   */
  generateEmptyMap = (width: number, height: number): EmptyMap => {
    const rect: Rect = { left: 0, top: 0, width, height };
    let section: Section = new Section({ rect });
    const splitter = SectionSplitter.create({
      minRoomWidth: MIN_ROOM_WIDTH,
      minRoomHeight: MIN_ROOM_HEIGHT,
      horizontalSectionPadding: HORIZONTAL_SECTION_PADDING,
      verticalSectionPadding: VERTICAL_SECTION_PADDING
    });
    section = splitter.splitRecursively(section);
    const connector = SectionConnector.create();
    section = connector.connectRecursively(section);
    const tileGenerator = TileGenerator.create();
    const tiles: TileType[][] = tileGenerator.generateTiles(section);

    return {
      width,
      height,
      tiles
    };
  };
}

export default RoomCorridorMapGenerator2;
