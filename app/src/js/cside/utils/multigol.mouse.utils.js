/**
 * Mouse events or listeners.
 */
var MouseUtils = function() {

	var _gol;

	this.init = function(gol) {
		_gol = gol;
	};

	this.canvasClicked = function(e) {

		/*
		var x = e.clientX - _gol.getCanvas().clientLeft;
		var y = e.clientY - _gol.getCanvas().clientTop;

		// The following code works for Chrome & FF. A more basic version above.
	    //var x = e.clientX; // + document.body.scrollLeft + document.documentElement.scrollLeft;
	    //var y = e.clientY; // + document.body.scrollTop + document.documentElement.scrollTop;
	    
	    x -= _gol.getCanvas().offsetLeft;
	    y -= _gol.getCanvas().offsetTop;

	    if (_gol.isLibTransfer() === true) {

	    	var pattern = new Pattern(x, y, _gol.getCellSize(), displayZone[0], displayZone[1],
	    		_gol.getGridWidth(), _gol.getGridHeight(), _gol.getCellColor(), 
	    		_gol.getNickName(), _gol.getXyFromLibStringValue());
	        _gol.getSocket().emit('hashmap-append', pattern.toJSON());
	        _gol.setLibTransfer(false);
	        _gol.setAllowLibTransfer(false);
	        cursorDeny();
	    }
	    */
	};
}