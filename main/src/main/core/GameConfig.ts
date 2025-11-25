import { AssetBundle } from '@main/assets/AssetBundle';

export type GameConfig = Readonly<{
  assetBundle: AssetBundle;
  screenWidth: number;
  screenHeight: number;
}>;
