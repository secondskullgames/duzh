import Section from './Section';
import SectionConnector from './SectionConnector';
import SectionSplitter from './SectionSplitter';
import TileGenerator from './TileGenerator';
import { AbstractMapGenerator } from '../AbstractMapGenerator';
import { TileType } from '@models/TileType';
import { Rect } from '@lib/geometry/Rect';

const HORIZONTAL_SECTION_PADDING = 2;
const VERTICAL_SECTION_PADDING = 2;

type Props = Readonly<{
  minRoomWidth: number;
  minRoomHeight: number;
}>;

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
export class RoomCorridorMapGenerator2 extends AbstractMapGenerator {
  private readonly minRoomWidth: number;
  private readonly minRoomHeight: number;
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

  constructor({ minRoomWidth, minRoomHeight }: Props) {
    super();
    this.minRoomWidth = minRoomWidth;
    this.minRoomHeight = minRoomHeight;
  }

  generateTiles = (width: number, height: number): TileType[][] => {
    const rect: Rect = { left: 0, top: 0, width, height };
    let section: Section = new Section({ rect });
    const splitter = this._createSplitter();
    section = splitter.splitRecursively(section);
    const connector = SectionConnector.create();
    section = connector.connectRecursively(section);
    const tileGenerator = TileGenerator.create();
    return tileGenerator.generateTiles(section);
  };

  private _createSplitter = (): SectionSplitter =>
    SectionSplitter.create({
      minRoomWidth: this.minRoomWidth,
      minRoomHeight: this.minRoomHeight,
      horizontalSectionPadding: HORIZONTAL_SECTION_PADDING,
      verticalSectionPadding: VERTICAL_SECTION_PADDING
    });
}
