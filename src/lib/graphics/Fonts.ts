export type FontBundle = Readonly<{
  getFont(fontName: string): FontInstance;
}>;

export const FontBundle = Symbol('FontBundle');

export type FontDefinition = Readonly<{
  name: string;
  src: string;
  letterWidth: number;
  letterHeight: number;
}>;

export type FontInstance = Readonly<{
  name: string;
  letterWidth: number;
  letterHeight: number;
  renderCharacter: (char: string) => ImageData;
}>;
