import Color from './Color';
import { Image } from './images/Image';
import { Pixel } from './Pixel';
import Rect from '../geometry/Rect';
import { getCanvasContext, getOffscreenCanvasContext } from '../utils/dom';

export interface Graphics {
  fillRect: (rect: Rect, color: Color) => void;
  fill: (color: Color) => void;
  drawImage: (image: Image, topLeft: Pixel) => void;
  drawImageBitmap: (bitmap: ImageBitmap, topLeft: Pixel) => void;
  drawScaledImage: (image: Image, rect: Rect) => void;
  getImageData: () => ImageData;
  putImageData: (imageData: ImageData, topLeft: Pixel) => void;
  getWidth: () => number;
  getHeight: () => number;
  getImageBitmap: () => Promise<ImageBitmap>;
}

class CanvasGraphics implements Graphics {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = getCanvasContext(canvas);
  }

  fillRect = (rect: Rect, color: Color) => {
    const { context } = this;
    context.fillStyle = color.hex;
    context.fillRect(rect.left, rect.top, rect.width, rect.height);
  };

  fill = (color: Color) => {
    const { canvas } = this;
    const rect = { left: 0, top: 0, width: canvas.width, height: canvas.height };
    this.fillRect(rect, color);
  };

  drawImage = (image: Image, topLeft: Pixel) => {
    this.context.drawImage(image.bitmap, topLeft.x, topLeft.y);
  };

  drawImageBitmap = (bitmap: ImageBitmap, topLeft: Pixel) => {
    this.context.drawImage(bitmap, topLeft.x, topLeft.y);
  };

  drawScaledImage = (image: Image, rect: Rect) => {
    this.context.drawImage(image.bitmap, rect.left, rect.top, rect.width, rect.height);
  };

  getImageData = (): ImageData => {
    return this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
  };

  putImageData = (imageData: ImageData, topLeft: Pixel) => {
    this.context.putImageData(imageData, topLeft.x, topLeft.y);
  };

  getWidth = () => this.canvas.width;
  getHeight = () => this.canvas.height;
  getImageBitmap = async (): Promise<ImageBitmap> => {
    const imageData = this.context.getImageData(0, 0, this.getWidth(), this.getHeight());
    return createImageBitmap(imageData);
  };
}

class OffscreenCanvasGraphics implements Graphics {
  private readonly canvas: OffscreenCanvas;
  private readonly context: OffscreenCanvasRenderingContext2D;

  constructor(canvas: OffscreenCanvas) {
    this.canvas = canvas;
    this.context = getOffscreenCanvasContext(canvas);
  }

  fillRect = (rect: Rect, color: Color) => {
    const { context } = this;
    context.fillStyle = color.hex;
    context.fillRect(rect.left, rect.top, rect.width, rect.height);
  };

  fill = (color: Color) => {
    const { canvas } = this;
    const rect = { left: 0, top: 0, width: canvas.width, height: canvas.height };
    this.fillRect(rect, color);
  };

  drawImage = (image: Image, topLeft: Pixel) => {
    this.context.drawImage(image.bitmap, topLeft.x, topLeft.y);
  };

  drawImageBitmap = (bitmap: ImageBitmap, topLeft: Pixel) => {
    this.context.drawImage(bitmap, topLeft.x, topLeft.y);
  };

  drawScaledImage = (image: Image, rect: Rect) => {
    this.context.drawImage(image.bitmap, rect.left, rect.top, rect.width, rect.height);
  };

  getImageData = (): ImageData => {
    return this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
  };

  putImageData = (imageData: ImageData, topLeft: Pixel) => {
    this.context.putImageData(imageData, topLeft.x, topLeft.y);
  };

  getWidth = () => this.canvas.width;
  getHeight = () => this.canvas.height;

  getImageBitmap = async (): Promise<ImageBitmap> => {
    return this.canvas.transferToImageBitmap();
  };
}

export namespace Graphics {
  export const forCanvas = (canvas: HTMLCanvasElement): Graphics => {
    return new CanvasGraphics(canvas);
  };

  export const forOffscreenCanvas = (canvas: OffscreenCanvas): Graphics => {
    return new OffscreenCanvasGraphics(canvas);
  };
}
