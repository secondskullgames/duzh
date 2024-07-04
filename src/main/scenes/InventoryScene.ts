import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import InventoryScreenInputHandler from '@main/input/screens/InventoryScreenInputHandler';
import InventoryRenderer from '@main/graphics/renderers/InventoryRenderer';
import { inject, injectable } from 'inversify';

@injectable()
export class InventoryScene implements Scene {
  readonly name = SceneName.INVENTORY;

  constructor(
    @inject(InventoryScreenInputHandler)
    readonly inputHandler: InventoryScreenInputHandler,
    @inject(InventoryRenderer)
    readonly renderer: InventoryRenderer
  ) {}
}
