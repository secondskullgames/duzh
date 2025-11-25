import { Color } from '@lib/graphics/Color';

const hexColors = {
  BLACK: '#000000',
  BLUE: '#0000ff',
  CYAN: '#00ffff',
  DARK_GRAY: '#808080',
  DARKER_GRAY: '#404040',
  DARK_RED: '#800000',
  GRAY_128: '#808080',
  GREEN: '#00ff00',
  GREEN_255: '#00ff00',
  LIGHT_GRAY: '#c0c0c0',
  ORANGE: '#ff8040',
  RED: '#ff0000',
  WHITE: '#ffffff',
  YELLOW: '#ffff00'
} as const;

export const InterfaceColors: Record<string, Color> = Object.fromEntries(
  Object.entries(hexColors).map(([name, hexColor]) => [name, Color.fromHex(hexColor)])
);
