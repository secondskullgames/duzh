export type DynamicSpriteModel = Readonly<{
  animations: {
    [key: string]: DynamicSprite_Animation;
  };
  name: string;
  offsets: DynamicSprite_Offsets;
  pattern?: string;
  patterns?: string[];
  transparentColor?: string;
}>;

export type DynamicSprite_Animation = Readonly<{
  frames: {
    activity: string;
    number: string;
  }[];
  pattern?: string;
}>;

export type DynamicSprite_Offsets = Readonly<{
  dx: number;
  dy: number;
}>;
