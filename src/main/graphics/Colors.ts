import { Color } from './Color';
import jsonColors from '@data/colors.json';
import { checkNotNull } from '@main/utils/preconditions';

export type ColorName = keyof typeof jsonColors;

type ColorShape = Record<ColorName, Color> &
  Readonly<{
    /**
     * @param name Should be a defined value in colors.json, but this is not statically known
     */
    colorForName: (name: string) => Color;
  }>;

const colors = {} as Record<ColorName, Color>;
for (const [name, value] of Object.entries(jsonColors)) {
  colors[name as ColorName] = Color.fromHex(value.toLowerCase());
}

const Colors: ColorShape = {
  ...colors,
  colorForName: (name: string): Color => {
    return checkNotNull(colors[name as ColorName], `Unknown color: ${name}`);
  }
};

export default Colors;
