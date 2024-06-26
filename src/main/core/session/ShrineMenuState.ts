import { GameState } from '@main/core/GameState';
import Shrine from '@main/objects/Shrine';

type OnUseFunc = (state: GameState) => Promise<void>;

export type ShrineOption = Readonly<{
  label: string;
  onUse: OnUseFunc;
}>;

type Props = Readonly<{
  shrine: Shrine;
  options: ShrineOption[];
}>;

export class ShrineMenuState {
  readonly shrine: Shrine;
  readonly options: ShrineOption[];
  private selectedOptionIndex: number;

  constructor({ shrine, options }: Props) {
    this.shrine = shrine;
    this.options = options;
    this.selectedOptionIndex = 0;
  }

  selectNextOption = () => {
    this.selectedOptionIndex = (this.selectedOptionIndex + 1) % this.options.length;
  };

  selectPreviousOption = () => {
    this.selectedOptionIndex =
      (this.selectedOptionIndex - 1 + this.options.length) % this.options.length;
  };

  getSelectedOption = (): ShrineOption => this.options[this.selectedOptionIndex];

  getShrine = (): Shrine => this.shrine;
}
