/**
 * Mouse events or listeners.
 */
var MouseUtils = function() {

	var _GOL = null;

	this.Init = function(gol) {
		_GOL = gol;
	};

	/*
	*
	*/
	this.CanvasClicked = function(e) {

		if (_GOL.isAllowLibTransfer() === false) {
			return;
		}

		var displayZone = _GOL.getDisplayZone();
	    var x = e.clientX - _GOL.getCanvas().clientLeft;
		var y = e.clientY - _GOL.getCanvas().clientTop;

		// The following code works for Chrome & FF. A more basic version above.
	    //var x = e.clientX; // + document.body.scrollLeft + document.documentElement.scrollLeft;
	    //var y = e.clientY; // + document.body.scrollTop + document.documentElement.scrollTop;
	    
	    x -= _GOL.getCanvas().offsetLeft;
	    y -= _GOL.getCanvas().offsetTop;

	    _GOL.setMouseX(x);
	    _GOL.setMouseY(y);

	    if (_GOL.getLibTransfer() === true) {
	        _GOL.getSocket().emit('hashmap-append', x + '~' + y + '~' + _GOL.getCellSize() + '~' + 
	            displayZone[0] + '~' + displayZone[1] + '~' + 
	            _GOL.getGridWidth() + '~' + _GOL.getGridHeight() + '~' +
	            _GOL.getCellColor() + '~' + _GOL.getNickName() + '~' + _GOL.getXyFromLibStringValue());
	        _GOL.setLibTransfer(false);
	        _GOL.setAllowLibTransfer(false);
	        CursorDeny();
	    }
	};
}