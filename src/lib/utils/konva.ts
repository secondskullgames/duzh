import { Graphics } from '@lib/graphics/Graphics';
import Konva from 'konva';

type Props = Readonly<{
  parentElement: HTMLDivElement;
  width: number;
  height: number;
}>;

/**
 * TODO - right now this is a grab bag of different stuff while I figure out the API
 */
export type KonvaContext = Readonly<{
  stage: Konva.Stage;
  canvasLayer: Konva.Layer;
  canvasElement: HTMLCanvasElement;
  canvasGraphics: Graphics;
  canvasImage: Konva.Image;
}>;

export const createKonvaContext = ({
  parentElement,
  width,
  height
}: Props): KonvaContext => {
  const stage = new Konva.Stage({
    container: parentElement.id,
    width,
    height
  });
  const canvasLayer = new Konva.Layer();
  stage.add(canvasLayer);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const graphics = Graphics.forCanvas(canvas);
  const canvasImage = new Konva.Image({
    image: canvas,
    x: 0,
    y: 0
  });
  canvasLayer.add(canvasImage);
  return {
    stage,
    canvasLayer,
    canvasElement: canvas,
    canvasGraphics: graphics,
    canvasImage
  };
};
