/*************************************************
 * Client window size functions.
 **************************************************/
/*
 * Get client screen size : width.
 */
function width() {
    return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0;
}

/*
 * Get client screen size : height.
 */
function height() {
    return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
}

/*
 * Get client screen size : width.
 */
function bodyWidth() {
    return document.body.clientWidth;
}

/*
 * Get client screen size : height.
 */
function bodyHeight() {
    return document.body.clientHeight;
}

/*************************************************
 * Cursor stuff.
 */
function CursorClear() {
    $('#gol_canvas').css('cursor', 'default');
}
function CursorCopy() {
    $('#gol_canvas').css('cursor', 'copy');
}
function CursorDeny() {
    $('#gol_canvas').css('cursor', 'not-allowed');   
}

/*
 * The keycodes that will be mapped when a user presses a button.
 * Original code by Doug McInnes.
 */
var KEY_CODES = {
    32: 'space',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    13: 'enter',
    107: 'add',
    109: 'substract',
    18: 'alt',
    27: 'esc',
}

/*
 * Creates the array to hold the KEY_CODES and sets all their values
 * to false. Checking true/flase is the quickest way to check status
 * of a key press and which one was pressed when determining
 * when to move and which direction.
 */
var KEY_STATUS = {};
for (var code in KEY_CODES) {
    KEY_STATUS[KEY_CODES[code]] = false;
}

/*
*
*/
function HashCode(str) {
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}