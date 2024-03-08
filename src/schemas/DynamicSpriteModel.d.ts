type DynamicSpriteModel = {
  animations: {
    [key: string]: DynamicSprite_Animation;
  };
  name: string;
  offsets: DynamicSprite_Offsets;
  pattern?: string;
  patterns?: string[];
  transparentColor?: string;
};

type DynamicSprite_Animation = {
  frames: {
    activity: string;
    number: string;
  }[];
  pattern?: string;
};

type DynamicSprite_Offsets = {
  dx: number;
  dy: number;
};

export default DynamicSpriteModel;
export type { DynamicSprite_Animation, DynamicSprite_Offsets };
