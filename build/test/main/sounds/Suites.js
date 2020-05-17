"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var AudioUtils_1 = require("./AudioUtils");
function _duplicate(samples) {
    return __spreadArrays(samples, samples);
}
var SUITE_1 = (function () {
    var FIGURE_1 = [[300, 2000], [200, 1000], [225, 1000]];
    var FIGURE_2 = [[300, 1000], [225, 1000], [200, 2000]];
    var FIGURE_3 = [[200, 1000], [225, 1000], [250, 2000]];
    var FIGURE_4 = [[300, 200], [250, 100], [225, 200], [600, 500], [300, 200], [200, 200], [225, 100], [200, 200], [225, 200], [300, 100], [600, 500], [300, 500], [600, 500], [250, 500], [300, 200], [200, 200], [250, 100], [300, 200], [225, 200], [250, 100]];
    var FIGURE_5 = [[600, 500], [225, 250], [250, 250], [500, 500], [600, 500], [400, 500], [250, 500], [200, 250], [225, 250], [300, 250], [400, 250]];
    var FIGURE_6 = [[600, 200], [0, 100], [600, 200], [0, 500], [600, 500], [0, 500]];
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
                bass: [FIGURE_2, FIGURE_3 /*, FIGURE_4*/],
                lead: [FIGURE_4]
            },
            SECTION_D: {
                bass: [FIGURE_3, FIGURE_4, FIGURE_6],
                lead: [FIGURE_4, FIGURE_5, FIGURE_6],
            }
        }
    };
})();
exports.SUITE_1 = SUITE_1;
var SUITE_2 = (function () {
    var FIGURE_1 = [[100, 1000], [80, 1000], [120, 1000], [80, 1000]]
        .map(AudioUtils_1.transpose8va);
    var FIGURE_2 = [[50, 1000], [80, 1000], [200, 1000], [240, 750], [230, 250]]
        //const FIGURE_2 = [[50,1000],[80,1000],[200,1000],[240,750],[/*230*/225,250]]
        .map(AudioUtils_1.transpose8va)
        .map(AudioUtils_1.transpose8va);
    var FIGURE_3 = [[300, 500], [240, 500], [225, 1000], [200, 750], [150, 250], [180, 1000]];
    // const FIGURE_3 = [[300,500],[/*235*/240,500],[225,1000],[200,750],[150,250],[180,1000]];
    var FIGURE_4 = [[50, 250], [80, 250], [100, 500], [80, 250], [100, 250], [225, 125], [200, 125], [180, 125], [150, 125], [50, 250], [80, 250], [100, 500], [80, 250], [100, 250], [225, 125], [200, 125], [180, 125], [150, 125]]
        .map(AudioUtils_1.transpose8va)
        .map(AudioUtils_1.transpose8va);
    var FIGURE_5 = [[300, 500], [200, 1000], [225, 500], [240, 500], [150, 1000], [100, 250], [180, 250]];
    //const FIGURE_5 = [[300,500],[200,1000],[225,500],[/*235*/240,500],[150,1000],[100,250],[180,250]];
    var FIGURE_6 = [[100, 250], [0, 250], [100, 250], [0, 250], [100, 250], [0, 250], [100, 250], [120, 250], [100, 250], [0, 250], [100, 250], [0, 250], [80, 250], [100, 250], [80, 250], [90, 250]]
        .map(AudioUtils_1.transpose8va);
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
                bass: [FIGURE_2, FIGURE_3 /*, FIGURE_4*/],
                lead: [FIGURE_4]
            },
            SECTION_D: {
                bass: [FIGURE_3, FIGURE_4, FIGURE_6],
                lead: [FIGURE_4, FIGURE_5, FIGURE_6],
            }
        }
    };
})();
exports.SUITE_2 = SUITE_2;
var SUITE_3 = (function () {
    var FIGURE_1 = [[100, 400], [0, 200], [50, 100], [0, 100], [100, 200], [50, 200], [100, 200], [0, 200], [100, 400], [0, 200], [50, 100], [0, 100], [100, 200], [50, 200], [100, 200], [0, 200], [80, 400], [0, 200], [40, 100], [0, 100], [80, 200], [40, 200], [80, 200], [0, 200], [80, 400], [0, 200], [40, 100], [0, 100], [80, 200], [40, 200], [80, 200], [0, 200]]
        .map(AudioUtils_1.transpose8va);
    var FIGURE_2 = [[200, 1400], [100, 200], [235, 800], [225, 800], [270, 1600], [300, 800], [270, 400], [235, 200], [225, 200]];
    var FIGURE_3 = [[75, 1600], [80, 1600], [100, 3200]]
        .map(AudioUtils_1.transpose8va);
    var FIGURE_4 = [[300, 200], [280, 400], [235, 100], [200, 100], [240, 400], [225, 200], [200, 100], [0, 100], [300, 200], [280, 400], [235, 100], [200, 100], [240, 400], [225, 200], [200, 100], [0, 100], [300, 200], [280, 400], [235, 100], [200, 100], [240, 400], [225, 200], [200, 100], [0, 100], [300, 200], [280, 400], [235, 100], [200, 100], [240, 400], [225, 200], [200, 100], [0, 100]];
    var FIGURE_5 = [[200, 800], [225, 400], [235, 400], [200, 200], [150, 200], [100, 400], [180, 800], [160, 600], [100, 200], [150, 200], [160, 200], [100, 400], [120, 200], [150, 200], [180, 400], [230, 800]]
        .map(AudioUtils_1.transpose8va);
    var FIGURE_6 = [[100, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [150, 150], [0, 50], [160, 150], [0, 50], [180, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [160, 150], [0, 50], [150, 150], [0, 50], [120, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [150, 150], [0, 50], [160, 150], [0, 50], [180, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [235, 150], [0, 50], [225, 150], [0, 50], [180, 150], [0, 50]];
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
                bass: [FIGURE_2, FIGURE_3 /*, FIGURE_4*/],
                lead: [FIGURE_4]
            },
            SECTION_D: {
                bass: [FIGURE_3, FIGURE_4, FIGURE_6],
                lead: [FIGURE_4, FIGURE_5, FIGURE_6],
            }
        }
    };
})();
exports.SUITE_3 = SUITE_3;
var SUITE_4 = (function () {
    var FIGURE_1 = [[100, 1920], [135, 1920], [100, 1920], [150, 1920]]
        .map(AudioUtils_1.transpose8va);
    var FIGURE_2 = [[80, 1920], [100, 1920], [120, 1920], [90, 1920]]
        .map(AudioUtils_1.transpose8va);
    var FIGURE_3 = [[100, 960], [150, 960], [120, 960], [135, 960], [100, 960], [150, 960], [120, 960], [135, 960]]
        .map(AudioUtils_1.transpose8va);
    var FIGURE_4 = _duplicate([[0, 240], [50, 240], [150, 240], [50, 240], [120, 240], [50, 240], [0, 480], [120, 240], [150, 240], [50, 240], [180, 1200]])
        .map(AudioUtils_1.transpose8va);
    var FIGURE_5 = [[200, 720], [240, 480], [0, 480], [270, 480], [280, 240], [270, 240], [240, 240], [270, 240], [240, 240], [0, 480], [200, 720], [240, 720], [0, 480], [300, 240], [360, 240], [300, 240], [280, 480], [0, 720]];
    var FIGURE_6 = _duplicate([[100, 200], [0, 40], [100, 240], [0, 240], [100, 240], [0, 960], [100, 200], [0, 40], [100, 200], [0, 40], [120, 480], [100, 200], [0, 40], [100, 200], [0, 40], [90, 480]])
        .map(AudioUtils_1.transpose8va);
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
                bass: [FIGURE_2, FIGURE_3 /*, FIGURE_4*/],
                lead: [FIGURE_4]
            },
            SECTION_D: {
                bass: [FIGURE_3, FIGURE_4, FIGURE_6],
                lead: [FIGURE_4, FIGURE_5, FIGURE_6],
            }
        }
    };
})();
exports.SUITE_4 = SUITE_4;
//# sourceMappingURL=Suites.js.map