import { AssetBundle, ImageBundle } from '@duzh/models';

export type GameConfig = Readonly<{
  assetBundle: AssetBundle;
  imageBundle: ImageBundle;
  screenWidth: number;
  screenHeight: number;
}>;
