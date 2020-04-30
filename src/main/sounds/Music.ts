import { randChoice } from '../utils/RandomUtils';
import { playMusic, stopMusic } from './AudioUtils';
import { Sample } from '../types/types';

function _transpose8va([freq, ms]: Sample): Sample {
  return [freq * 2, ms];
}

function _transpose8vb([freq, ms]: Sample): Sample {
  return [freq / 2, ms];
}

function _duplicate(samples: Sample[]): Sample[] {
  return [...samples, ...samples];
}

type Figure = Sample[];

type Suite = {
  length: number;
  sections: {
    [sectionName: string]: {
      bass?: Figure[],
      lead?: Figure[],
    }
  }
}

const SUITE_1: Suite = (() => {
  const FIGURE_1: Figure = [[300,2000],[200,1000],[225,1000]];
  const FIGURE_2: Figure = [[300,1000],[225,1000],[200,2000]];
  const FIGURE_3: Figure = [[200,1000],[225,1000],[250,2000]];
  const FIGURE_4: Figure = [[300,200],[250,100],[225,200],[600,500],[300,200],[200,200],[225,100],[200,200],[225,200],[300,100],[600,500],[300,500],[600,500],[250,500],[300,200],[200,200],[250,100],[300,200],[225,200],[250,100]];
  const FIGURE_5: Figure = [[600,500],[225,250],[250,250],[500,500],[600,500],[400,500],[250,500],[200,250],[225,250],[300,250],[400,250]];
  const FIGURE_6: Figure = [[600,200],[0,100],[600,200],[0,500],[600,500],[0,500]];

  return {
    length: 4000,
    sections: {
      SECTION_A: {
        bass: [FIGURE_1, FIGURE_6]
      },
      SECTION_B: {
        bass: [FIGURE_1, FIGURE_2, FIGURE_4],
        lead: [FIGURE_4, FIGURE_5]
      },
      SECTION_C: {
        bass: [FIGURE_2, FIGURE_3/*, FIGURE_4*/],
        lead: [FIGURE_4]
      },
      SECTION_D: {
        bass: [FIGURE_3, FIGURE_4, FIGURE_6],
        lead: [FIGURE_4, FIGURE_5, FIGURE_6],
      }
    }
  };
})();

const SUITE_2: Suite = (() => {
  const FIGURE_1: Figure = (<Sample[]>[[100,1000],[80,1000],[120,1000],[80,1000]])
    .map(_transpose8va);
  const FIGURE_2: Figure = (<Sample[]>[[50,1000],[80,1000],[200,1000],[240,750],[230,250]])
  //const FIGURE_2 = [[50,1000],[80,1000],[200,1000],[240,750],[/*230*/225,250]]
    .map(_transpose8va)
    .map(_transpose8va);
  const FIGURE_3: Figure = [[300,500],[240,500],[225,1000],[200,750],[150,250],[180,1000]];
  // const FIGURE_3 = [[300,500],[/*235*/240,500],[225,1000],[200,750],[150,250],[180,1000]];
  const FIGURE_4: Figure = (<Sample[]>[[50,250],[80,250],[100,500],[80,250],[100,250],[225,125],[200,125],[180,125],[150,125],[50,250],[80,250],[100,500],[80,250],[100,250],[225,125],[200,125],[180,125],[150,125]])
    .map(_transpose8va)
    .map(_transpose8va);
  const FIGURE_5: Figure = [[300,500],[200,1000],[225,500],[240,500],[150,1000],[100,250],[180,250]];
  //const FIGURE_5 = [[300,500],[200,1000],[225,500],[/*235*/240,500],[150,1000],[100,250],[180,250]];
  const FIGURE_6: Figure = (<Sample[]>[[100,250],[0,250],[100,250],[0,250],[100,250],[0,250],[100,250],[120,250],[100,250],[0,250],[100,250],[0,250],[80,250],[100,250],[80,250],[90,250]])
    .map(_transpose8va);

  return {
    length: 4000,
    sections: {
      SECTION_A: {
        bass: [FIGURE_1, FIGURE_6]
      },
      SECTION_B: {
        bass: [FIGURE_1, FIGURE_2, FIGURE_4],
        lead: [FIGURE_4, FIGURE_5]
      },
      SECTION_C: {
        bass: [FIGURE_2, FIGURE_3/*, FIGURE_4*/],
        lead: [FIGURE_4]
      },
      SECTION_D: {
        bass: [FIGURE_3, FIGURE_4, FIGURE_6],
        lead: [FIGURE_4, FIGURE_5, FIGURE_6],
      }
    }
  };
})();

const SUITE_3: Suite = (() => {
  const FIGURE_1: Figure = (<Sample[]>[[100,400],[0,200],[50,100],[0,100],[100,200],[50,200],[100,200],[0,200],[100,400],[0,200],[50,100],[0,100],[100,200],[50,200],[100,200],[0,200],[80,400],[0,200],[40,100],[0,100],[80,200],[40,200],[80,200],[0,200],[80,400],[0,200],[40,100],[0,100],[80,200],[40,200],[80,200],[0,200]])
    .map(_transpose8va);
  const FIGURE_2: Figure = [[200,1400],[100,200],[235,800],[225,800],[270,1600],[300,800],[270,400],[235,200],[225,200]];
  const FIGURE_3: Figure = (<Sample[]>[[75,1600],[80,1600],[100,3200]])
    .map(_transpose8va);
  const FIGURE_4: Figure = [[300,200],[280,400],[235,100],[200,100],[240,400],[225,200],[200,100],[0,100],[300,200],[280,400],[235,100],[200,100],[240,400],[225,200],[200,100],[0,100],[300,200],[280,400],[235,100],[200,100],[240,400],[225,200],[200,100],[0,100],[300,200],[280,400],[235,100],[200,100],[240,400],[225,200],[200,100],[0,100]];
  const FIGURE_5: Figure = (<Sample[]>[[200,800],[225,400],[235,400],[200,200],[150,200],[100,400],[180,800],[160,600],[100,200],[150,200],[160,200],[100,400],[120,200],[150,200],[180,400],[230,800]])
    .map(_transpose8va);
  const FIGURE_6: Figure = [[100,150],[0,50],[100,150],[0,50],[100,150],[0,50],[100,150],[0,50],[100,150],[0,50],[150,150],[0,50],[160,150],[0,50],[180,150],[0,50],[100,150],[0,50],[100,150],[0,50],[100,150],[0,50],[100,150],[0,50],[100,150],[0,50],[160,150],[0,50],[150,150],[0,50],[120,150],[0,50],[100,150],[0,50],[100,150],[0,50],[100,150],[0,50],[100,150],[0,50],[100,150],[0,50],[150,150],[0,50],[160,150],[0,50],[180,150],[0,50],[100,150],[0,50],[100,150],[0,50],[100,150],[0,50],[100,150],[0,50],[100,150],[0,50],[235,150],[0,50],[225,150],[0,50],[180,150],[0,50]];

  return {
    length: 6400,
    sections: {
      SECTION_A: {
        bass: [FIGURE_1, FIGURE_6]
      },
      SECTION_B: {
        bass: [FIGURE_1, FIGURE_2, FIGURE_4],
        lead: [FIGURE_4, FIGURE_5]
      },
      SECTION_C: {
        bass: [FIGURE_2, FIGURE_3/*, FIGURE_4*/],
        lead: [FIGURE_4]
      },
      SECTION_D: {
        bass: [FIGURE_3, FIGURE_4, FIGURE_6 ],
        lead: [FIGURE_4, FIGURE_5, FIGURE_6],
      }
    }
  };
})();

const SUITE_4: Suite = (() => {
  const FIGURE_1: Figure = (<Sample[]>[[100,1920],[135,1920],[100,1920],[150,1920]])
    .map(_transpose8va);
  const FIGURE_2: Figure = (<Sample[]>[[80,1920],[100,1920],[120,1920],[90,1920]])
    .map(_transpose8va);
  const FIGURE_3: Figure = (<Sample[]>[[100,960],[150,960],[120,960],[135,960],[100,960],[150,960],[120,960],[135,960]])
    .map(_transpose8va);
  const FIGURE_4: Figure = _duplicate(<Sample[]>[[0,240],[50,240],[150,240],[50,240],[120,240],[50,240],[0,480],[120,240],[150,240],[50,240],[180,1200]])
    .map(_transpose8va);
  const FIGURE_5: Figure = [[200,720],[240,480],[0,480],[270,480],[280,240],[270,240],[240,240],[270,240],[240,240],[0,480],[200,720],[240,720],[0,480],[300,240],[360,240],[300,240],[280,480],[0,720]];
  const FIGURE_6: Figure = _duplicate(<Sample[]>[[100,200],[0,40],[100,240],[0,240],[100,240],[0,960],[100,200],[0,40],[100,200],[0,40],[120,480],[100,200],[0,40],[100,200],[0,40],[90,480]])
    .map(_transpose8va);

  return {
    length: 7680,
    sections: {
      SECTION_A: {
        bass: [FIGURE_1, FIGURE_6]
      },
      SECTION_B: {
        bass: [FIGURE_1, FIGURE_2, FIGURE_4],
        lead: [FIGURE_4, FIGURE_5]
      },
      SECTION_C: {
        bass: [FIGURE_2, FIGURE_3/*, FIGURE_4*/],
        lead: [FIGURE_4]
      },
      SECTION_D: {
        bass: [FIGURE_3, FIGURE_4, FIGURE_6 ],
        lead: [FIGURE_4, FIGURE_5, FIGURE_6],
      }
    }
  };
})();

let ACTIVE_SUITE: Suite | null = null;

function playSuite(suite: Suite) {
  ACTIVE_SUITE = suite;
  const sections = Object.values(suite.sections);
  const numRepeats = 4;
  for (let i = 0; i < sections.length; i++) {
    let section = sections[i];
    const bass = (!!section.bass) ? randChoice(section.bass) : null;
    let lead: Figure | null;
    if (!!section.lead) {
      do {
        lead = randChoice(section.lead);
      } while (lead === bass);
    }

    for (let j = 0; j < numRepeats; j++) {
      setTimeout(() => {
        if (suite === ACTIVE_SUITE) {
          const figures = [
            ...(!!bass ? [bass.map(_transpose8vb)] : []),
            ...(!!lead ? [lead] : [])
          ];
          figures.forEach(figure => playMusic(figure));
        }
      }, ((numRepeats * i) + j) * suite.length);
    }
  }
  setTimeout(
    () => {
      if (suite === ACTIVE_SUITE) {
        playSuite(suite);
      }
    },
    sections.length * suite.length * numRepeats
  );
}

function stop() {
  stopMusic();
  ACTIVE_SUITE = null;
}

export default {
  SUITE_1,
  SUITE_2,
  SUITE_3,
  SUITE_4,
  playSuite,
  stop
};
