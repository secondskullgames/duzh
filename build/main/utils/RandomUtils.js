/**
 * @param max inclusive
 */
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function randChoice(list) {
    return list[randInt(0, list.length - 1)];
}
/**
 * Fisher-Yates.  Stolen from https://bost.ocks.org/mike/shuffle/
 */
function shuffle(list) {
    var n = list.length;
    // While there remain elements to shuffle...
    while (n > 0) {
        // Pick a remaining element...
        var i = randInt(0, n - 1);
        n--;
        // And swap it with the current element.
        var tmp = list[n];
        list[n] = list[i];
        list[i] = tmp;
    }
}
function weightedRandom(probabilities, mappedObjects) {
    var total = Object.values(probabilities).reduce(function (a, b) { return a + b; });
    var rand = Math.random() * total;
    var counter = 0;
    var entries = Object.entries(probabilities);
    for (var i = 0; i < entries.length; i++) {
        var _a = entries[i], key = _a[0], value = _a[1];
        counter += value;
        if (counter > rand) {
            return mappedObjects[key];
        }
    }
    throw 'Error in weightedRandom()!';
}
export { randInt, randChoice, weightedRandom, shuffle };
//# sourceMappingURL=RandomUtils.js.map