type Figure = Sample[];

type Sample = [number, number];

type Suite = {
  length: number;
  sections: {
    [sectionName: string]: {
      bass?: Figure[],
      lead?: Figure[],
    }
  }
}

export {
  Figure,
  Sample,
  Suite
};