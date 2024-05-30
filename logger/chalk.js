const kleur = require('kleur');

const colors = {
    black: kleur.black,
    red: kleur.red,
    green: kleur.green,
    yellow: kleur.yellow,
    blue: kleur.blue,
    magenta: kleur.magenta,
    cyan: kleur.cyan,
    white: kleur.white,
    gray: kleur.gray,
    grey: kleur.grey
};

function log(text = '', color = 'white', bold = false) {
    let styledText = colors[color] ? colors[color](text) : kleur.white(text);
    if (bold) {
        styledText = kleur.bold(styledText);
    }
    console.log(styledText);
}

module.exports = log