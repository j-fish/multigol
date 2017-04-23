/**
 * HTML canvas for drawing patterns.
 */
var PatternDraw = function PatternDraw(patternUtils) {

    const MAX_INT = 1000000000000; // 10^12
    const MIN_INT = -1000000000000; // -10^12
    const _fieldCanvasId = '#gol_pattern_field';
    var _utils = patternUtils;
    var _drawCanvasId;
	var _gol;
	var _canvas;
    var _fieldCanvas;
	var _ctx;
    var _ctxField;
	var _hashTable; // main map for drawing.
    var _fieldHashTable; //
	var _cellCount;
    var _tmpX = undefined, _tmpY = undefined;
    var _mouseX = undefined, _mouseY = undefined, _deltaX = undefined, _deltaY = undefined;
    var _rotating = false;
    var _draggableState = false;
    var _mouseDown = false;

	this.init = function(gol, drawCanvasId) {
        _drawCanvasId = drawCanvasId;
		_gol = gol;
		_cellCount = 0;
		this.initCanvas(drawCanvasId);
		_hashTable = new HashTable();
        _fieldHashTable = new HashTable();
		this.addListeners();
        _rotating = false;
        _draggableState = false;
        _mouseDown = false;
        _fieldCanvas = document.getElementById(_fieldCanvasId.replace('#',''));
        _ctxField = _fieldCanvas.getContext('2d');
	};

	this.initCanvas = function(drawCanvasId) {
		_canvas = document.getElementById(drawCanvasId);
		let cWidth = $(window).width();
        let cHeight = $(window).height();
        _canvas.height = cHeight;
        _canvas.width = cWidth;
        _ctx = _canvas.getContext('2d');
        _ctx.fillStyle = 'rgba(130,120,120,' + 0.7 + ')';
        _ctx.fillRect(0, 0, _canvas.width, _canvas.height);
	};

    this.cleanup = function() {
        _rotating = false;
        _draggableState = false;
        _mouseDown = false;
        _hashTable.clear();
        _fieldHashTable.clear();
        _cellCount = 0;
        _tmpX = undefined;
        _tmpY = undefined;
        _utils.clearCanvas(_ctx, _canvas); 
        _utils.clearFieldCanvas(_ctxField, _fieldCanvas);      
        $(_fieldCanvasId).hide();
        reDraw();
    };

	this.addListeners = function() {
        _canvas.addEventListener('dblclick', this.canvasClicked, false);
        _canvas.addEventListener('mousedown', this.canvasMouseDown, false);
        _canvas.addEventListener('mouseup', this.canvasMouseUp, false);
        _canvas.addEventListener('mousemove', this.canvasMouseMouved, false);
    };

    this.canvasClicked = function(e) {

        let delCell = false;
        let x = e.clientX - _canvas.clientLeft;
        let y = e.clientY - _canvas.clientTop;
        let tmpCell;
        let cellFound = false;
        x -= _canvas.offsetLeft;
        y -= _canvas.offsetTop;

        // Affect virtual grid coordinates based on celle size.
        x = Math.floor(x / _gol.getCellSize());
        y = Math.floor(y / _gol.getCellSize());
        _tmpX = x;
        _tmpY = y;

        if (_gol.isLibTransfer() === true) {

            _cellCount = 0;
            let libData = gol.getXyFromLib();
            let xy;
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
            
            tmpCell = _utils.formatCell(x, y);
            
            // If canvas has cell then remove it (as if unselected).
            for (var cell in _hashTable.items) {

                if (cell.toString() === tmpCell) {
                    _hashTable.removeItem(tmpCell);
                    --_cellCount;    
                    delCell = true;                    
                }

                // temp x,y must be updated :
                let a = _utils.getMinMaxYX(_hashTable, MAX_INT, MIN_INT);
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
        _utils.drawField(_utils.getMinMaxYX(_hashTable, MAX_INT, MIN_INT), _ctx, _gol, 
            _drawCanvasId, _fieldCanvas, _fieldCanvasId);
    };

    this.canvasMouseDown = function(e) {
        _mouseDown = true;
        setTimeout(function() { 
            if (!_mouseDown) return;  
            _draggableState = true;  
            cursorGrab();    
            updateMouseXY(e);
            updateFieldDelta(e);
            drawPatternField();
        }, 700);
    };

    this.canvasMouseUp = function(e) { 
        _mouseDown = false;
        _draggableState = false;
        cursorCopy();
        updateMouseXY(e);
        appendFieldPattern();
        _utils.clearFieldCanvas(_ctxField, _fieldCanvas);
        reDraw();
        _utils.drawField(_utils.getMinMaxYX(_hashTable, MAX_INT, MIN_INT), _ctx, _gol, 
            _drawCanvasId, _fieldCanvas, _fieldCanvasId);
    };

    this.canvasMouseMouved = function(e) {
        if (!_mouseDown || !_draggableState) return;
        updateMouseXY(e);
        updateFieldPosition(e);
    };

    this.send = function() {

		let pattern = '';
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
        let w = 0, h = 0, l = 0, dX = 0, dY = 0;
        let xy, m;
        let a = _utils.getMinMaxYX(_hashTable, MAX_INT, MIN_INT); // { min x, min y, max x, max y }
        let minX = a[0], maxX = a[2], minY = a[1], maxY = a[3];
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
        a = _utils.getMinMaxYX(_hashTable, MAX_INT, MIN_INT);
        updateTmpXYWH(a);
        _utils.drawField(a, _ctx, _gol, _drawCanvasId, _fieldCanvas, _fieldCanvasId);
    };

    this.reDraw = function() {
        _utils.clearCanvas(_ctx, _canvas);
        reDraw();        
    };

    this.reDrawField = function() {
        _utils.drawField(_utils.getMinMaxYX(_hashTable, MAX_INT, MIN_INT), _ctx, 
            _gol, _drawCanvasId, _fieldCanvas, _fieldCanvasId); 
    };

    var appendFieldPattern = function() {

        let xy, tmpCell;
        let p = $(_fieldCanvasId).position();
        _tmpX = Math.floor(parseInt(p.left) / _gol.getCellSize());
        _tmpY = Math.floor(parseInt(p.top) / _gol.getCellSize());
        _cellCount = 0;

        for (var cell in _fieldHashTable.items) {
            ++_cellCount;
            xy = cell.toString().split('$');
            tmpCell = _utils.formatCell(parseInt(_tmpX) + parseInt(xy[0]), 
                    parseInt(_tmpY) + parseInt(xy[1]));
            _hashTable.setItem(tmpCell, _cellCount.toString());        
        }

        _fieldHashTable.clear();
    };

    var drawPatternField = function() {

        let xy;
        let a = _utils.getMinMaxYX(_hashTable, MAX_INT, MIN_INT); // { min x, min y, max x, max y }
        let minX = a[0], minY = a[1];
        _cellCount = 0;

        for (var cell in _hashTable.items) {
            xy = cell.toString().split('$');
            ++_cellCount;
            _fieldHashTable.setItem(_utils.formatCell(parseInt(xy[0]) - parseInt(minX), 
                parseInt(xy[1]) - parseInt(minY)), _cellCount.toString());
        }

        _hashTable.clear();
        _utils.clearCanvas(_ctx, _canvas);
        _utils.clearFieldCanvas(_ctxField, _fieldCanvas);
        for (var cell in _fieldHashTable.items) {
            xy = cell.toString().split('$');
            _utils.draw(xy[0], xy[1], _ctxField, _gol);
        }
    };

    var updateMouseXY = function(e) {       
        _mouseX = e.clientX - _canvas.clientLeft;
        _mouseY = e.clientY - _canvas.clientTop;
        _mouseX -= _canvas.offsetLeft;
        _mouseY -= _canvas.offsetTop;
    };

    var updateFieldPosition = function(e) {
        $(_fieldCanvasId).css({
            top: _mouseY - _deltaY,
            left: _mouseX - _deltaX            
        });
    };

    var updateFieldDelta = function(e) {
        let p = $(_fieldCanvasId).position();
        _deltaX = _mouseX - p.left;
        _deltaY = _mouseY - p.top;
    };

    var reDraw = function() {
        let xy;
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