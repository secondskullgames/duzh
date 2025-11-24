import { Coordinates } from '@lib/geometry/Coordinates';
import { checkArgument, checkState } from '@duzh/utils/preconditions';

type Props = Readonly<{
  width: number;
  height: number;
}>;

export default class Grid<T> {
  readonly width: number;
  readonly height: number;
  private readonly array: T[][];

  constructor({ width, height }: Props) {
    this.width = width;
    this.height = height;
    this.array = [];

    for (let y = 0; y < height; y++) {
      this.array[y] = [];
    }
  }

  static fromArray = <T>(array: T[][]): Grid<T> => {
    const width = array[0].length;
    const height = array.length;
    const grid = new Grid<T>({ width, height });
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        grid.put({ x, y }, array[y][x]);
      }
    }
    return grid;
  };

  get = (coordinates: Coordinates): T | null => {
    checkArgument(this.contains(coordinates));
    const { x, y } = coordinates;
    return this.array[y][x] ?? null;
  };

  put = (coordinates: Coordinates, item: T) => {
    checkArgument(this.contains(coordinates));
    const { x, y } = coordinates;
    this.array[y][x] = item;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  remove = (coordinates: Coordinates, item: T) => {
    checkArgument(this.contains(coordinates));
    const { x, y } = coordinates;
    checkState(!!this.array[y][x]);
    delete this.array[y][x];
  };

  getAll = (): T[] => {
    return Object.values(this.array).flatMap(row => row);
  };

  contains = ({ x, y }: Coordinates): boolean => {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  };
}
