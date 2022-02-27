import jsonColors from '../../../data/colors.json';

const Colors: Record<string, string> = {};
for (const [name, value] of Object.entries(jsonColors)) {
  Colors[name] = value.toLowerCase();
}

/** A color is just a color in hex format, typically with the leading #. */
type Color = string;

namespace Color {
  export const equals = (first: Color, second: Color) => first.toLowerCase() === second.toLowerCase();
}

export default Color;
export { Colors };
