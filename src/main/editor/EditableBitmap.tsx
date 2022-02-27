import React, { MouseEvent, useEffect, useState } from 'react';
import { hex2rgb } from '../graphics/images/ImageUtils';
import Color, { Colors } from '../types/Color';
import { Pixel } from '../types/types';
import styles from './EditableBitmap.css';
import { Tool } from './ToolPicker';
import fromRGB = Color.fromRGB;

const LEFT_BUTTON = 1;
const RIGHT_BUTTON = 2;

type Props = {
  width: number,
  height: number,
  zoomLevel: number,
  mainColor: Color,
  altColor: Color,
  setMainColor: (color: Color) => void,
  setAltColor: (color: Color) => void,
  selectedTool: Tool
};

const EditableBitmap = ({ width, height, zoomLevel, mainColor, altColor, selectedTool, setMainColor, setAltColor }: Props) => {
  const draw = (canvas: HTMLCanvasElement, color: Color, { x, y }: Pixel) => {
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    console.log(`${x},${y}`);

    context.fillStyle = color;
    context.fillRect(x, y, 1, 1);
  };

  const getPixel = (e: MouseEvent, canvas: HTMLCanvasElement): Pixel => ({
    x: Math.floor((e.clientX - canvas.offsetLeft + document.documentElement.scrollLeft) / zoomLevel),
    y: Math.floor((e.clientY - canvas.offsetTop + document.documentElement.scrollTop) / zoomLevel)
  });

  const isLeftButton = (e: MouseEvent): boolean => (e.buttons & LEFT_BUTTON) > 0;
  const isRightButton = (e: MouseEvent): boolean => {
    if ((e.buttons & RIGHT_BUTTON) > 0) {
      return true;
    }
    if (((e.buttons & LEFT_BUTTON) > 0) && e.ctrlKey) {
      return true;
    }
    return false;
  };

  const canvasRef = React.createRef<HTMLCanvasElement>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d') as CanvasRenderingContext2D;
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`${styles.canvas} ${styles[selectedTool.toLowerCase()]}`}
      width={width}
      height={height}
      style={{
        width: width * zoomLevel,
        height: height * zoomLevel
      }}
      onMouseDown={(e: MouseEvent) => {
        const canvas = e.target as HTMLCanvasElement;
        switch (selectedTool) {
          case 'DRAW':
            if (isLeftButton(e)) {
              draw(canvas, mainColor, getPixel(e, canvas));
            } else if (isRightButton(e)) {
              draw(canvas, altColor, getPixel(e, canvas));
            }
            break;
          case 'PICK':
            const { x, y } = getPixel(e, canvas);
            const context = canvas.getContext('2d') as CanvasRenderingContext2D;
            const [r, g, b] = context.getImageData(x, y, 1, 1).data;
            const color = Color.fromRGB({ r, g, b });
            if (color === null) {
              return;
            }

            if (isLeftButton(e)) {
              setMainColor(color);
            } else if (isRightButton(e)) {
              setAltColor(color);
            }
            break;
          case 'FILL':
            // TODO
            if (isLeftButton(e)) {
              draw(canvas, mainColor, getPixel(e, canvas));
            } else if (isRightButton(e)) {
              draw(canvas, altColor, getPixel(e, canvas));
            }
            break;
        }
      }}
      onMouseMove={(e: MouseEvent) => {
        const canvas = e.target as HTMLCanvasElement;
        // TODO copy pasted
        switch (selectedTool) {
          case 'DRAW':
            if (isLeftButton(e)) {
              draw(canvas, mainColor, getPixel(e, canvas));
            } else if (isRightButton(e)) {
              draw(canvas, altColor, getPixel(e, canvas));
            }
            break;
          case 'PICK':
            const { x, y } = getPixel(e, canvas);
            const context = canvas.getContext('2d') as CanvasRenderingContext2D;
            const [r, g, b] = context.getImageData(x, y, 1, 1).data;
            const color = Color.fromRGB({ r, g, b });
            if (color === null) {
              return;
            }

            if (isLeftButton(e)) {
              setMainColor(color);
            } else if (isRightButton(e)) {
              setAltColor(color);
            }
            break;
        }
      }}
      onContextMenu={(e: MouseEvent) => e.preventDefault()}
    />
  );
};

export default EditableBitmap;
