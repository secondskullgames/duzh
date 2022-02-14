import jsonColors from '../../../data/colors.json';
import { hex2rgb } from '../graphics/images/ImageUtils';
import RGB from '../graphics/images/RGB';

const Colors: Record<string, string> = {};
for (const [name, value] of Object.entries(jsonColors)) {
  Colors[name] = value.toLowerCase();
}

type Color = string;

namespace Color {
  export const fromRGB = ({ r, g, b }: RGB): Color | null => {
    for (const [name, value] of Object.entries(Colors)) {
      if (RGB.equals(hex2rgb(value), { r, g, b })) {
        return value;
      }
    }
    return null;
  };

  export const equals = (first: Color, second: Color) => first.toLowerCase() === second.toLowerCase();
}

export default Color;
export { Colors };
