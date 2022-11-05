import { Renderer } from '../graphics/renderers/Renderer';

type Props = {
  renderer: Renderer
};

export class GameEngine {
  private renderer: Renderer;
  constructor({ renderer }: Props) {
    this.renderer = renderer;
  }

  render = async () => this.renderer.render();
}