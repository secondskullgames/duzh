import { AssetBundle } from '@duzh/assets';
import { ImageBundle } from '@main/assets/ImageBundle';

export type GameConfig = Readonly<{
  assetBundle: AssetBundle;
  imageBundle: ImageBundle;
  screenWidth: number;
  screenHeight: number;
}>;
