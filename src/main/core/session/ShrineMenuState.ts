type OnUseFunc = () => Promise<void>;

export type ShrineOption = Readonly<{
  label: string;
  onUse: OnUseFunc;
}>;

type Props = Readonly<{
  options: ShrineOption[];
}>;

export class ShrineMenuState {
  readonly options: ShrineOption[];
  private selectedOptionIndex: number;

  constructor({ options }: Props) {
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
}
