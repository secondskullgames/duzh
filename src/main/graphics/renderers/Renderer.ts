export interface Renderer {
  render: () => Promise<ImageData>;
}
