/**
 * HTML canvas for drawing patterns.
 */
var PatternDraw = function PatternDraw() {

	var _gol;
	var _canvas;
	var _ctx;
	var _hashTable; // main map for drawing.
    var _tHashTable; // secondary map for transposing.
	var _cellCount;
    var _tmpX = undefined, _tmpY = undefined;
    var _patternMode;
    var MAX_INT = 1000000000;
    var MIN_INT = -1000000000;
    var _rotating = false;

	this.init = function(gol, drawCanvasId) {
		_gol = gol;
		_cellCount = 0;
		this.initCanvas(drawCanvasId);
		_hashTable = new HashTable();
        _tHashTable = new HashTable();
		this.addListeners();
        _patternMode = false;
        _rotating = false;
	};

	this.initCanvas = function(drawCanvasId) {
		_canvas = document.getElementById(drawCanvasId);
		var cWidth = $(window).width();
        var cHeight = $(window).height();
        _canvas.height = cHeight;
        _canvas.width = cWidth;
        _ctx = _canvas.getContext('2d');
        _ctx.fillStyle = 'rgba(130,120,120,' + 0.7 + ')';
        _ctx.fillRect(0, 0, _canvas.width, _canvas.height);
	};

    this.cleanup = function() {
        _patternMode = false;
        _rotating = false;
        _hashTable.clear();
        _tHashTable.clear();
        _cellCount = 0;
        _tmpX = undefined;
        _tmpY = undefined;
        clearCanvas();
        reDraw();
    };

	this.addListeners = function() {
        _canvas.addEventListener('click', this.canvasClicked, false);
    };

    this.canvasClicked = function(e) {

        if (_patternMode) return;
        var x = e.clientX - _canvas.clientLeft;
        var y = e.clientY - _canvas.clientTop;
        var tmpCell;
        var cellFound = false;
        x -= _canvas.offsetLeft;
        y -= _canvas.offsetTop;
        // Affect virtual grid coordinates based on celle size.
        x = Math.floor(x / _gol.getCellSize());
        y = Math.floor(y / _gol.getCellSize());
        _tmpX = x;
        _tmpY = y;

        if (_gol.isLibTransfer() === true) {

            _patternMode = true;
            _hashTable.clear();
            _cellCount = 0;
            clearCanvas();
            var libData = gol.getXyFromLib();
            var xy;
            for (var i = 0; i < libData.length; ++i) {
                xy = libData[i].split('$');
                tmpCell = formatCell(parseInt(_tmpX) + parseInt(xy[0]), parseInt(_tmpY) + parseInt(xy[1]));
                ++_cellCount;
                _hashTable.setItem(tmpCell, _cellCount.toString());
                _tHashTable.setItem(formatCell(parseInt(xy[0]), parseInt(xy[1])), _cellCount.toString());
                reDraw(); 
            }

            _gol.setLibTransfer(false);
            _gol.setAllowLibTransfer(true);
            cursorDeny();
            drawField(getMinMaxYX());

        } else if (!_patternMode) {

            tmpCell = formatCell(x, y);
            // If canvas has cell then remove it (as if unselected).
            for (var cell in _hashTable.items) {
                if (cell.toString() === tmpCell) {
                    _hashTable.removeItem(tmpCell);
                    --_cellCount;
                    clearCanvas();
                    reDraw();
                    return;
                }
            }

            ++_cellCount;
            _hashTable.setItem(tmpCell, _cellCount.toString());
            draw(x, y); 
        }
    };

    this.send = function() {
		var pattern = '';
    	for (var cell in _hashTable.items) pattern += cell.toString() + '~';
    	_hashTable.clear();
    	if (pattern.length <= 0) return;
    	pattern = pattern.substring(0, pattern.length - 1);
    	clearCanvas();
	    _gol.getSocket().emit('hashmap-append', 
	    	new Pattern(0, 0, _gol.getCellSize(), _gol.getDisplayZone()[0], 
    		_gol.getDisplayZone()[1], _gol.getGridWidth(), _gol.getGridHeight(), 
    		_gol.getCellColor(), _gol.getNickName(), pattern)
	    );
        this.cleanup();
    };

    this.rotate = function() {
        
        var w = 0, h = 0, l = 0;
        var xy, m;
        var minX = MAX_INT, minY = MAX_INT, maxX = MIN_INT, maxY = MIN_INT;
        _cellCount = 0;
        var c = 0;
 
        for (var cell in _tHashTable.items) {
            xy = cell.toString().split('$');
            minX = parseInt(xy[0]) < minX ? parseInt(xy[0]) : minX;
            maxX = parseInt(xy[0]) > maxX ? parseInt(xy[0]) : maxX;
            minY = parseInt(xy[1]) < minY ? parseInt(xy[1]) : minY;
            maxY = parseInt(xy[1]) > maxY ? parseInt(xy[1]) : maxY;
            ++c;
        } 

        w = maxX;
        h = maxY;
        l = h > w ? parseInt(h) + 1 : parseInt(w) + 1;

        m = buildMatrix(l, l);
        for (var cell in _tHashTable.items) {
            xy = cell.toString().split('$');
            m[parseInt(xy[0])][parseInt(xy[1])] = true;
        }

        _hashTable.clear()
        _tHashTable.clear();   
        for (var x = 0; x < l; x++) {
            for (var y = 0; y < l; y++) {
                if (m[l - y - 1][x]) {
                    ++_cellCount;
                    _hashTable.setItem(formatCell(parseInt(x) + parseInt(_tmpX), 
                        parseInt(y) + parseInt(_tmpY)), 
                        _cellCount.toString());
                    _tHashTable.setItem(formatCell(x, y), _cellCount.toString());
                }
            }
        }

        clearCanvas();        
        reDraw();
        var a = getMinMaxYX();
        updateTmpXYWH(a);
        drawField(a);
    };

    this.reDraw = function() {
        clearCanvas();
        reDraw();        
    };

    var reDraw = function() {
        var xy;
        for (var cell in _hashTable.items) {
            xy = cell.toString().split('$');
            draw(xy[0], xy[1]);
        }
    };

    var updateTmpXYWH = function(a) {
        
        if (!_rotating) {
            _rotating = true;            
            _tmpX = parseInt(a[0]);
            _tmpY = parseInt(a[1]);
        }    
    };

    var getMinMaxYX = function() {

        var a = new Array(4);        
        var minX = MAX_INT, minY = MAX_INT, maxX = MIN_INT, maxY = MIN_INT;

        for (var cell in _hashTable.items) {
            xy = cell.toString().split('$');
            minX = parseInt(xy[0]) < minX ? parseInt(xy[0]) : minX;
            maxX = parseInt(xy[0]) > maxX ? parseInt(xy[0]) : maxX;
            minY = parseInt(xy[1]) < minY ? parseInt(xy[1]) : minY;
            maxY = parseInt(xy[1]) > maxY ? parseInt(xy[1]) : maxY;
        }   

        a[0] = minX
        a[1] = minY;
        a[2] = maxX;
        a[3] = maxY;

        return a;
    };

    var clearCanvas = function() {
    	_ctx.clearRect(0, 0, _canvas.width, _canvas.height);
    	_ctx.fillStyle = 'rgba(130,120,120,' + 0.7 + ')';
        _ctx.fillRect(0, 0, _canvas.width, _canvas.height);
    };

    var draw = function(x, y) {

    	var image;
    	var cellSize = _gol.getCellSize();
    	var clientNicknameHash = hashString(_gol.getNickName());
    	var elem = document.getElementById('is-client-icon-' + clientNicknameHash);        
        if (elem != null) var cellimg = elem.innerText || elem.textContent;

        if (_gol.isDrawDetailedCells()) {
        
            // = 0 if no image to draw else > 0
            if (cellimg != null && cellimg != undefined && parseInt(cellimg) > 0) {

                // draw img :
                image = new Image();
                image.src = document.getElementById('client-icon-' + clientNicknameHash).src;
                _ctx.drawImage(image, parseInt(x * cellSize), parseInt(y * cellSize), 
                    cellSize, cellSize);

            } else {

                // draw square.
                _ctx.fillStyle = _gol.getCellColor();
                _ctx.fillRect(parseInt(x * cellSize), parseInt(y * cellSize), 
                    cellSize, cellSize);
            }

        } else {
            // draw all squares as black: < 4 in size.
            _ctx.fillStyle = 'black'
            _ctx.fillRect(parseInt(x * cellSize), parseInt(y * cellSize), 
                cellSize, cellSize);
        }

    };

    var drawField = function(a) {
        _ctx.beginPath();
        _ctx.lineWidth = '1';
        _ctx.strokeStyle = 'cyan';
        _ctx.rect(
            Math.floor((parseInt(a[0]) * _gol.getCellSize()) - 3), 
            Math.floor((parseInt(a[1]) * _gol.getCellSize()) - 3), 
            Math.floor(((parseInt(a[2] - a[0]) + 1) * _gol.getCellSize()) + 6), 
            Math.floor(((parseInt(a[3] - a[1]) + 1) * _gol.getCellSize()) + 6)
        );
        _ctx.stroke();
    };

    var formatCell = function(x, y) {
    	return x.toString() + '$' + y.toString();
    };

    var buildMatrix = function(w, h) {
        var m = new Array(w);
        for (var i = 0; i < w; i++) m[parseInt(i)] = new Array(parseInt(h));
        return m;        
    };

    var logM = function(m, w, h) {

        var s = '';
        for (var y = 0; y < w; y++) {
            for (var x = 0; x < h; x++) s += m[x][y] === true ? 'X' : ' ';
            s += '\n';
        }

        console.log('\n' + s);
    };

}