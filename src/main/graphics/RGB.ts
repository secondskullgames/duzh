type RGB = {
  r: number,
  g: number,
  b: number
};

namespace RGB {
  export const equals = (first: RGB, second: RGB) => (
    first.r === second.r
    && first.g === second.g
    && first.b === second.b
  );
}

export default RGB;
