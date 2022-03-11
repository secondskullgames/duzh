import Offsets from '../../geometry/Offsets';
import Color from '../../types/Color';

type StaticSpriteModel = {
  name: string,
  filename: string,
  offsets: Offsets,
  transparentColor: Color
};

export default StaticSpriteModel;
