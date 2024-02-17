export type RGB = Readonly<{
  r: number;
  g: number;
  b: number;
}>;

export namespace RGB {
  export const equals = (first: RGB, second: RGB) =>
    first.r === second.r && first.g === second.g && first.b === second.b;
}
