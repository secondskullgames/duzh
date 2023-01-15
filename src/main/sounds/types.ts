export type Figure = Sample[];

export type SoundEffect = Sample[];
export type Sample = [number, number];

export type Suite = {
  length: number;
  sections: {
    [sectionName: string]: {
      bass?: Figure[],
      lead?: Figure[],
    }
  }
}
