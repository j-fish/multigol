/**
 * HTML canvas for drawing patterns.
 */
var PatternDraw = function PatternDraw() {

	var _gol;
	var _canvas;
	var _ctx;
	var _hastTable;

	this.init = function(gol, drawCanvasId) {
		_gol = gol;
		this.initCanvas(drawCanvasId);
		_hastTable = new HashTable();
	};

	this.initCanvas = function(drawCanvasId) {

		_canvas = document.getElementById(drawCanvasId);
		var cWidth = $(window).width();
        var cHeight = $(window).height();
        _canvas.height = cHeight;
        _canvas.width = cWidth;
        _ctx = _canvas.getContext('2d');
        _ctx.fillStyle = 'rgba(32, 45, 21, ' + 0.7 + ')';
        _ctx.fillRect(0, 0, _canvas.width, _canvas.height);
	};

	this.addListeners = function() {
        _canvas.addEventListener('click', mouseUtils.canvasClicked, false);
    };

    this.canvasClicked = function(e) {

	    var x = e.clientX - _canvas.clientLeft;
		var y = e.clientY - _canvas.clientTop;
	    x -= _canvas.offsetLeft;
	    y -= _canvas.offsetTop;

    };

}