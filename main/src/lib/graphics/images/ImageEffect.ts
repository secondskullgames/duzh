export type ImageEffect = {
  name: string;
  apply: (imageData: ImageData) => ImageData;
};
