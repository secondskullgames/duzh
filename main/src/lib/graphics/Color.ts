import { RGB } from '@lib/graphics/RGB';

export type Color = Readonly<{
  hex: string;
  rgb: RGB;
}>;

const colorMatcher = new RegExp(/^#[a-zA-Z0-9]{6}$/);

/**
 * Convert a hex string, e.g. '#00c0ff', to its equivalent RGB values, e.g. (0, 192, 255).
 */
const hex2rgb = (hex: string): RGB => {
  const matches = hex.match(colorMatcher)?.[0];
  if (!matches || matches.length !== 7) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  return {
    r: parseInt(matches.slice(1, 3), 16),
    g: parseInt(matches.slice(3, 5), 16),
    b: parseInt(matches.slice(5, 7), 16)
  };
};

const rgb2hex = ({ r, g, b }: RGB): string => {
  const p = (n: number) => (n > 15 ? n.toString(16) : `0${n.toString(16)}`);
  return `#${p(r)}${p(g)}${p(b)}`;
};

export namespace Color {
  const _hex2Color: Record<string, Color> = {};
  export const fromHex = (hex: string) => {
    if (_hex2Color[hex]) {
      return _hex2Color[hex];
    }
    const matches = hex.match(colorMatcher)?.[0];
    if (!matches) {
      throw new Error(`Invalid hex color: ${hex}`);
    }
    const color = {
      hex,
      rgb: hex2rgb(hex)
    };
    _hex2Color[hex] = color;
    return color;
  };

  export const fromRGB = (rgb: RGB) => ({
    rgb,
    hex: rgb2hex(rgb)
  });

  export const equals = (first: Color, second: Color): boolean =>
    first.hex === second.hex;

  export const WHITE = Color.fromHex('#ffffff');
  export const BLACK = Color.fromHex('#ffffff');
}
