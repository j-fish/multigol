/**
 * HTML canvas for drawing patterns.
 */
var PatternDraw = function PatternDraw() {

	var _gol;
	var _canvas;
	var _ctx;
	var _hastTable;
	var _cellCount;

	this.init = function(gol, drawCanvasId) {
		_gol = gol;
		_cellCount = -1;
		this.initCanvas(drawCanvasId);
		_hastTable = new HashTable();
		this.addListeners();
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

	this.addListeners = function() {
        _canvas.addEventListener('click', this.canvasClicked, false);
    };

    this.canvasClicked = function(e) {

	    var x = e.clientX - _canvas.clientLeft;
		var y = e.clientY - _canvas.clientTop;
	    x -= _canvas.offsetLeft;
	    y -= _canvas.offsetTop;
	    // Affect virtual grid coordinates based on celle size.
	    x = Math.floor(x / _gol.getCellSize());
	    y = Math.floor(y / _gol.getCellSize());

	    _hastTable.setItem(formatCell(x, y), ++_cellCount);
	    draw(x, y);
    };

    this.send = function() {

    	/* Code from Mouse utils canvasClicked :
    	var pattern = new Pattern(x, y, _GOL.getCellSize(), displayZone[0], displayZone[1],
	    		_GOL.getGridWidth(), _GOL.getGridHeight(), _GOL.getCellColor(), 
	    		_GOL.getNickName(), _GOL.getXyFromLibStringValue());
	        _GOL.getSocket().emit('hashmap-append', pattern.toJSON());
	    */

    	var pattern = '';
    	for (var cell in _hastTable.items) {
    		pattern += cell.toString() + '~';
    	}

    	pattern = pattern.substring(0, pattern.length - 1);
    	alert(pattern);
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

    var formatCell = function(x, y) {
    	return x.toString() + '$' + y.toString();
    };

}