import { AssetBundle } from '@main/assets/AssetBundle';
import { ImageBundle } from '@main/assets/ImageBundle';

export type GameConfig = Readonly<{
  assetBundle: AssetBundle;
  imageBundle: ImageBundle;
  screenWidth: number;
  screenHeight: number;
}>;
