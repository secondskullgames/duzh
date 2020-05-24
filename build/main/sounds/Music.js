"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var SoundPlayer_1 = require("./SoundPlayer");
var RandomUtils_1 = require("../utils/RandomUtils");
var AudioUtils_1 = require("./AudioUtils");
// TODO very hacky memoizing
var PLAYER = null;
var ACTIVE_SUITE = null;
var _getMusicPlayer = function () { return new SoundPlayer_1.default(4, 0.12); };
function playSuite(suite) {
    ACTIVE_SUITE = suite;
    var sections = Object.values(suite.sections);
    var numRepeats = 4;
    var _loop_1 = function (i) {
        var section = sections[i];
        var bass = (!!section.bass) ? RandomUtils_1.randChoice(section.bass) : null;
        var lead;
        if (!!section.lead) {
            do {
                lead = RandomUtils_1.randChoice(section.lead);
            } while (lead === bass);
        }
        for (var j = 0; j < numRepeats; j++) {
            setTimeout(function () {
                if (suite === ACTIVE_SUITE) {
                    var figures = __spreadArrays((!!bass ? [bass.map(AudioUtils_1.transpose8vb)] : []), (!!lead ? [lead] : []));
                    figures.forEach(function (figure) { return playMusic(figure); });
                }
            }, ((numRepeats * i) + j) * suite.length);
        }
    };
    for (var i = 0; i < sections.length; i++) {
        _loop_1(i);
    }
    setTimeout(function () {
        if (suite === ACTIVE_SUITE) {
            playSuite(suite);
        }
    }, sections.length * suite.length * numRepeats);
}
function playMusic(samples) {
    if (!PLAYER) {
        PLAYER = _getMusicPlayer();
    }
    PLAYER.playSound(samples, false);
}
function stopMusic() {
    if (PLAYER) {
        PLAYER.stop();
    }
}
function stop() {
    stopMusic();
    ACTIVE_SUITE = null;
}
exports.default = {
    playSuite: playSuite,
    stop: stop
};
//# sourceMappingURL=Music.js.map