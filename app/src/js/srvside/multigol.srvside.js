/*************************************************
* MULTIGOL. Variables.
**************************************************/
var _generation = 0;
var _intervalSpeed = 200;
var _interval;
var _hashTable;
var _newBornCellsHashTable;
var _dyingCellsHashTable;
var _io;
var _ready = true;

/**
 * 
 */
exports.Init = function(io) {

    _io = io;
    console.log('____________________________________________________'.random);
    console.log('|_ init server multigol.'.random);
    _hashTable = new HashTable();
    _newBornCellsHashTable = new HashTable();
    _dyingCellsHashTable = new HashTable();

    StartGOL();
};

/*
* Add from lib to hashtable.
* Spatial display zone must be calculated with the pattern coordinates,
* this way patterns can be added anywhere in "infinite" space. 
*
* params :
* x : client mouse click x
* y : client mouse click y
* xx : cells absolute X position in a virtual viewport starting at x:0 y:0
* yy : cells absolute Y position in a virtual viewport starting at x:0 y:0
* cellColor : hex, string or rgb color value for drawing
* zX : the zone X coordinate (-infinity too +infinity)
* zY : the zone Y coordinate (-infinity too +infinity)
* gW : clients grid width size in cell values (viewport width / cell size in px)
* gH : clients grid height size
* cellSize : cellSize used by client (from >0 to 30 @see client side gol script)
* clientNickname for retreiving data from global hash table.
*/
exports.IORunLibInput = function(x, y, xx, yy, cellColor, zX, zY, gW, gH, clientNickname, cellSize) {

    var gridX = parseInt(x / cellSize) + parseInt(xx) + parseInt(gW * zX);
    var gridY = parseInt(y / cellSize) + parseInt(yy) + parseInt(gH * zY);

    if (CheckCoordinates(gridX, gridY) === false) {
        return;
    }

    var key = gridX.toString() + '$' + gridY.toString();

    if (_hashTable.hasItem(key) === false) {
        _hashTable.setItem(key, {life:1, nickname:clientNickname, hexc:cellColor});
        //logInput(x, y, xx, yy, cellColor, zX, zY, gW, gH, clientNickname, cellSize, gridX, gridY);
    }
}
function logInput(x, y, xx, yy, cellColor, zX, zY, gW, gH, clientNickname, cellSize, gridX, gridY) {
    console.log('x = ' + x);
    console.log('y = ' + y);
    console.log('xx = ' + xx);
    console.log('yy = ' + yy);
    console.log('zx = ' + zX);
    console.log('zy = ' + zY);
    console.log('gw = ' + gW);
    console.log('gh = ' + gH);
    console.log('gx = ' + gridX);
    console.log('gy = ' + gridY);
    console.log('cellsize = ' + cellSize);
}

/*
* Check value for NaN or other reasons. 
*/
function CheckCoordinates(x, y) {
    return x != NaN && y != NaN;
}

/**
 * Remove cells by color.
 */
exports.RemoveCellsByColor = function(color) {

    for (var cell in _hashTable.items) {
        if (_hashTable.getItem(cell).hexc == color) {
            _hashTable.removeItem(cell);
        }
    }
}

/**
 * Remove cells by nickname.
 */
exports.RemoveCellsByNickname = function(nn) {

    for (var cell in _hashTable.items) {
        if (_hashTable.getItem(cell).nickname == nn) {
            _hashTable.removeItem(cell);
        }
    }
}

/*
* Start the process.
*/
function StartGOL() {

    _interval = setInterval(function() {   
        if (_ready === false) {
            return;
        }
        Main();
    }, _intervalSpeed);
}

/**
 * Main calls here.
 */ 
function Main() {

    _ready = false;
    IterateGOL();
    var data = '';
    for (var cell in _hashTable.items) {
        data += _hashTable.getItem(cell).nickname + '$';
        data += _hashTable.getItem(cell).hexc + '$';
        data += cell.toString();
        data += '/';
    }
    data = data.substring(0, data.length - 1);
    _io.emit('hashmap-draw', data);
    _ready = true;
}

/*
* Main GOL loop.
* Decide if Cell lives or dies.
*/
function IterateGOL() { 
    
    var totalCells = 0;

    for (var cell in _hashTable.items) { // Search for cells around the coordiantes.
        if (CellLife(cell, false) === false) { // Dying cell.
            _dyingCellsHashTable.setItem(cell, _hashTable.getItem(cell));
        } else {
            // If return === true just leave the cell in the hashtable.
            ++totalCells;
        }
    }

    // Add all new born cells (_newBornCellsHashTable) to main hashtable for next iteration.
    for (var cell in _newBornCellsHashTable.items) {
        _hashTable.setItem(cell, _newBornCellsHashTable.getItem(cell)); // Add cell to hashtable.
        ++totalCells;
    }

    // Iterate _dyingCellsHashTable : 
    for (var cell in _dyingCellsHashTable.items) {
        _hashTable.removeItem(cell); // Remove the dying cells.
    }

    // Clear the temp hashtables for next generation.
    _newBornCellsHashTable.clear();
    _dyingCellsHashTable.clear();

    _generation++; // Increment generation.
    _io.emit('notify-total-cellcount', totalCells);
}

/*
* Cell lives or dies : return bool. Calculates for one cell.
* Param : deadCell is boolean. If seeking for new born cells this param = true.
* This function is used in a recursive way when dealing with dead cells.
*/
function CellLife(cell, deadCell) {
    
    var liveCount = 0;
    var xy = cell.toString().split('$');
    var x = parseInt(xy[0]);
    var y = parseInt(xy[1]);

    // Neighbour cells. Based on coordinates of param cell.
    var neighbourCells = new Array(
            (x - 1) + '$' +  (y - 1),
            x + '$' +  (y - 1),
            (x + 1) + '$' +  (y - 1),
            (x + 1) + '$' +  y,
            (x + 1) + '$' +  (y + 1),
            x + '$' +  (y + 1),
            (x - 1) + '$' +  (y + 1),
            (x - 1) + '$' +  y
        );

    for (var i = 0; i < neighbourCells.length; i++) { // Search & count cells around the param cell.
        if (_hashTable.hasItem(neighbourCells[i]) === true) { // Don't deal with dead cells here.
            if (_hashTable.getItem(neighbourCells[i]).life == 1) { // It's an alive one.     
                liveCount++; // So count it.
            }
        }
    }

    if (liveCount > 0 && deadCell === false) {
        // Iterate through the neighbour cells of the cell that has > 0 neighbours and
        // therefor has possibly 3 neighbours : dead cell that becomes alive.
        for (var i = 0; i < neighbourCells.length; i++) {
            // If it's an alive cell we are not interested here. Only dead cells can live on the 
            // condition that they have exactly 3 live cells surrounding them.
            if (_hashTable.hasItem(neighbourCells[i]) === false) {
                if (CellLife(neighbourCells[i], true) === true) { // Recursive call here for liveCount = exactly 3.  
                    _newBornCellsHashTable.setItem(neighbourCells[i], _hashTable.getItem(cell)); // Then it's a new born cell.
                } 
            }
        }
    }

    // Check the amount of living cells found around the param one.
    if ((liveCount === 2 || liveCount === 3) && deadCell === false) { // Cell survives.
        return true;
    } else if (liveCount === 3 && deadCell === true) { // Cell is born.
        return true;
    } else if (liveCount > 3) { // Cell dies 
        return false;
    } else { // Cell dies (count is < 2).
        return false;
    }
}

/*************************************************
* HashTable obj.
**************************************************/
/**
 * @param {type} obj
 * @returns {HashTable}
 */
function HashTable(obj) {

    this.length = 0;
    this.items = {};

    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            this.items[p] = obj[p];
            this.length++;
        }
    }

    this.setItem = function(key, value) {
        var previous = undefined;
        if (this.hasItem(key)) {
            previous = this.items[key];
        } else {
            this.length++;
        }
        this.items[key] = value;

        return previous;
    };
    
    this.getKey = function(value) {
        for (var key in this.items) {
            if (this.getItem(key) === value) {
                return key.toString();
            }
        }
    };

    this.getItem = function(key) {
        return this.hasItem(key) ? this.items[key] : undefined;
    };

    this.hasItem = function(key) {
        return this.items.hasOwnProperty(key);
    };

    this.removeItem = function(key) {

        if (this.hasItem(key)) {
            var previous = this.items[key];
            this.length--;
            delete this.items[key];
            return previous;
        } else {
            return undefined;
        }
    };

    this.keys = function() {
        var keys = [];
        for (var k in this.items) {
            if (this.hasItem(k)) {
                keys.push(k);
            }
        }

        return keys;
    };

    this.values = function() {
        var values = [];
        for (var k in this.items) {
            if (this.hasItem(k)) {
                values.push(this.items[k]);
            }
        }

        return values;
    };

    this.each = function(fn) {
        for (var k in this.items) {
            if (this.hasItem(k)) {
                fn(k, this.items[k]);
            }
        }
    };

    this.clear = function() {
        this.items = {};
        this.length = 0;
    };
} // End.