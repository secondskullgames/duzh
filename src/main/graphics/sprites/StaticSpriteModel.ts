import Color from '../../types/Color';
import { Offsets } from '../../types/types';

type StaticSpriteModel = {
  name: string,
  filename: string,
  offsets: Offsets,
  transparentColor: Color // TODO: this should be a color name (`Colors`)
};

export default StaticSpriteModel;
