import TileSet from '../../../tiles/TileSet';
import TileType from '../../../tiles/TileType';
import EmptyRegionConnection from '../  EmptyRegionConnection';
import Connection from './Connection';
import AbstractMapGenerator from '../AbstractMapGenerator';
import EmptyMap from '../EmptyMap';
import MapPruner from './MapPruner';
import RegionConnector from './RegionConnector';
import RegionSplitter from './RegionSplitter';
import RoomRegion from './RoomRegion';
import TileGenerator from './TileGenerator';

type Props = {
  tileSet: TileSet,
  minRoomDimension: number,
  maxRoomDimension: number
};

const MIN_ROOM_FRACTION = 0.4;
const MAX_ROOM_FRACTION = 0.8;

class RoomCorridorMapGenerator extends AbstractMapGenerator {
  /**
   * inner width, not including wall
   */
  private readonly minRoomDimension: number;
  /**
   * inner width, not including wall
   */
  private readonly maxRoomDimension: number;

  constructor({ tileSet, minRoomDimension, maxRoomDimension }: Props) {
    super(tileSet);
    this.minRoomDimension = minRoomDimension;
    this.maxRoomDimension = maxRoomDimension;
  }

  /**
   * @override {@link AbstractMapGenerator#generateEmptyMap}
   */
  protected generateEmptyMap = (width: number, height: number): EmptyMap => {
    // 1. Recursively subdivide the map into regions.
    //    Each region must fall within the max dimensions.
    // 2. Add rooms within regions, with appropriate padding.
    //    (Don't add a room for every region; approximately half.  Rules TBD.)
    const splitter = new RegionSplitter({
      minRoomDimension: this.minRoomDimension,
      maxRoomDimension: this.maxRoomDimension
    });

    const mapPruner = new MapPruner({
      minRoomFraction: MIN_ROOM_FRACTION,
      maxRoomFraction: MAX_ROOM_FRACTION
    });

    const regions: RoomRegion[] = splitter.generateRegions(0, 0, width, height);
    mapPruner.removeRooms(regions);

    // 3. Construct a minimal spanning tree between regions (including those without rooms).
    const minimalSpanningTree: Connection[] = RegionConnector.generateMinimalSpanningTree(regions);
    // 4.  Add all optional connections between regions.
    const optionalConnections: Connection[] = RegionConnector.generateOptionalConnections(regions, minimalSpanningTree);
    // 5. Add "red-red" connections in empty regions.
    // 6. Add "red-green" connections in empty regions only if:
    //    - both edges connect to a region with a room
    //    - there is no "red-red" connection in the region
    const emptyRegionConnections: EmptyRegionConnection[] = RegionConnector.generateEmptyRegionConnections(regions, minimalSpanningTree, optionalConnections);

    const externalConnections = [...minimalSpanningTree, ...optionalConnections];
    mapPruner.stripOrphanedConnections(externalConnections, emptyRegionConnections);

    const debugOutput = `
      Room regions: ${regions.map(RoomRegion.toString).join('; ')}
      MST: ${minimalSpanningTree.map(Connection.toString).join('; ')}
      opt: ${optionalConnections.map(Connection.toString).join('; ')}
      external: ${externalConnections.map(Connection.toString).join('; ')}
      Internal: ${emptyRegionConnections.map(connection => `${RoomRegion.toString(connection.roomRegion)}, ${connection.neighbors.length}`).join('; ')}
    `;

    console.debug(debugOutput);

    // Compute the actual tiles based on region/connection specifications.
    const tiles: TileType[][] = TileGenerator.generateTiles(width, height, regions, externalConnections, emptyRegionConnections);

    return {
      tiles,
      rooms: [], // TODO
      width,
      height
    };
  };
}

export default RoomCorridorMapGenerator;
