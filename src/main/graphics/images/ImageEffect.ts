import Colors from '../Colors';
import { replaceAll } from './ImageUtils';

type ImageEffect = {
  name: string,
  apply: (imageData: ImageData) => Promise<ImageData>
};

namespace ImageEffect {
  export const DAMAGED: ImageEffect = {
    name: 'DAMAGED',
    apply: (img: ImageData) => replaceAll(img, Colors.WHITE)
  };
}

export default ImageEffect;
