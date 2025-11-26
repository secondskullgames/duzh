import { AssetBundle, ImageBundle } from '@duzh/assets';

export type GameConfig = Readonly<{
  assetBundle: AssetBundle;
  imageBundle: ImageBundle;
  screenWidth: number;
  screenHeight: number;
}>;
