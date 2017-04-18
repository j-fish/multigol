/**
 * HTML canvas for drawing patterns.
 */
var PatternDraw = function PatternDraw(patternUtils) {

    var _utils = patternUtils;
	var _gol;
	var _canvas;
	var _ctx;
	var _hashTable; // main map for drawing.
	var _cellCount;
    var _tmpX = undefined, _tmpY = undefined;
    var _mouseX = undefined, _mouseY = undefined;
    var MAX_INT = 1000000000000; // 10^12
    var MIN_INT = -1000000000000; // -10^12
    var _rotating = false;

	this.init = function(gol, drawCanvasId) {
		_gol = gol;
		_cellCount = 0;
		this.initCanvas(drawCanvasId);
		_hashTable = new HashTable();
		this.addListeners();
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
        _rotating = false;
        _hashTable.clear();
        _cellCount = 0;
        _tmpX = undefined;
        _tmpY = undefined;
        _utils.clearCanvas(_ctx, _canvas);
        reDraw();
    };

	this.addListeners = function() {
        _canvas.addEventListener('click', this.canvasClicked, false);
        _canvas.addEventListener('mousedown', this.canvasMouseDown, false);
        _canvas.addEventListener('mouseup', this.canvasMouseUp, false);
    };

    this.canvasClicked = function(e) {

        var delCell = false;
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

            _cellCount = 0;
            var libData = gol.getXyFromLib();
            var xy;
            for (var i = 0; i < libData.length; ++i) {
                xy = libData[i].split('$');
                tmpCell = _utils.formatCell(parseInt(_tmpX) + parseInt(xy[0]), 
                    parseInt(_tmpY) + parseInt(xy[1]));
                ++_cellCount;
                _hashTable.setItem(tmpCell, _cellCount.toString());
            }

            _gol.setLibTransfer(false);
            _gol.setAllowLibTransfer(true);

        } else {

            if (_mouseX !== x || _mouseY !== y) return;
            tmpCell = _utils.formatCell(x, y);
            
            // If canvas has cell then remove it (as if unselected).
            for (var cell in _hashTable.items) {

                if (cell.toString() === tmpCell) {
                    _hashTable.removeItem(tmpCell);
                    --_cellCount;    
                    delCell = true;                    
                }

                // temp x,y must be updated :
                var a = _utils.getMinMaxYX(_hashTable);
                _tmpX = a[0];
                _tmpY = a[1];
            }

            if (!delCell) {
                ++_cellCount;
                _hashTable.setItem(tmpCell, _cellCount.toString());
                _utils.draw(x, y, _ctx, _gol); 
            }
        }

        _utils.clearCanvas(_ctx, _canvas);
        reDraw();
        _utils.drawField(_utils.getMinMaxYX(_hashTable), _ctx, _gol);
    };

    this.canvasMouseDown = function(e) {
        _mouseX = e.clientX - _canvas.clientLeft;
        _mouseY = e.clientY - _canvas.clientTop;
        _mouseX -= _canvas.offsetLeft;
        _mouseY -= _canvas.offsetTop;
        _mouseX = Math.floor(_mouseX / _gol.getCellSize());
        _mouseY = Math.floor(_mouseY / _gol.getCellSize());
    };

    this.canvasMouseUp = function(e) { 
        _mouseX = e.clientX - _canvas.clientLeft;
        _mouseY = e.clientY - _canvas.clientTop;
        _mouseX -= _canvas.offsetLeft;
        _mouseY -= _canvas.offsetTop;
        _mouseX = Math.floor(_mouseX / _gol.getCellSize());
        _mouseY = Math.floor(_mouseY / _gol.getCellSize());
    };

    this.send = function() {
		var pattern = '';
    	for (var cell in _hashTable.items) pattern += cell.toString() + '~';
    	_hashTable.clear();
    	if (pattern.length <= 0) return;
    	pattern = pattern.substring(0, pattern.length - 1);
    	_utils.clearCanvas(_ctx, _canvas);
	    _gol.getSocket().emit('hashmap-append', 
	    	new Pattern(0, 0, _gol.getCellSize(), _gol.getDisplayZone()[0], 
    		_gol.getDisplayZone()[1], _gol.getGridWidth(), _gol.getGridHeight(), 
    		_gol.getCellColor(), _gol.getNickName(), pattern)
	    );
        this.cleanup();
    };

    this.rotate = function() {
        
        if (_tmpX === undefined || _tmpY === undefined) return;
        var w = 0, h = 0, l = 0, dX = 0, dY = 0;
        var xy, m;
        var a = _utils.getMinMaxYX(_hashTable); // { min x, min y, max x, max y }
        var minX = a[0], maxX = a[2], minY = a[1], maxY = a[3];
        _cellCount = 0;

        dX = maxX - minX;
        dY = maxY - minY;
        w = dX;
        h = dY;
        l = h > w ? parseInt(h) + 1 : parseInt(w) + 1;

        m = _utils.buildMatrix(l, l);
        for (var cell in _hashTable.items) {
            xy = cell.toString().split('$');
            m[parseInt(xy[0]) - minX][parseInt(xy[1]) - minY] = true;
        }

        _hashTable.clear();
        for (var x = 0; x < l; x++) {
            for (var y = 0; y < l; y++) {
                if (m[l - y - 1][x]) {
                    ++_cellCount;
                    _hashTable.setItem(_utils.formatCell(parseInt(x) + parseInt(_tmpX), 
                        parseInt(y) + parseInt(_tmpY)), 
                        _cellCount.toString());
                }
            }
        }

        _utils.clearCanvas(_ctx, _canvas);        
        reDraw();
        a = _utils.getMinMaxYX(_hashTable);
        updateTmpXYWH(a);
        _utils.drawField(a, _ctx, _gol);
    };

    this.reDraw = function() {
        _utils.clearCanvas(_ctx, _canvas);
        reDraw();        
    };

    this.reDrawField = function() {
        _utils.drawField(_utils.getMinMaxYX(_hashTable), _ctx, _gol); 
    };

    var reDraw = function() {
        var xy;
        for (var cell in _hashTable.items) {
            xy = cell.toString().split('$');
            _utils.draw(xy[0], xy[1], _ctx, _gol);
        }
    };

    var updateTmpXYWH = function(a) {
        
        if (!_rotating) {
            _rotating = true;            
            _tmpX = parseInt(a[0]);
            _tmpY = parseInt(a[1]);
        }    
    };

}