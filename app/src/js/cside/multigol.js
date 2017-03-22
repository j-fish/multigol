/** Conway's game of life in JS.*/var GOL = function GOL() {    /*    * Global Variables.    */    var _twoD = '2d';    var _canvas;    var _ctx = null;    var _gridWidth = 0;    var _gridHeight = 0;    var _zonePopulation = 0;    var _population = 0;    var _serverCellPopulation = 0;    var _cellSize = 20;    var _cellColor = '#2D3D40';    var _xyFromLib;    var _xyFromLibStringValue = '';    var _libTransfer = false; // if dragging a pattern from lib.    var _allowLibTransfer = true;    var _px = 'px';    var _marginTop = 30; // Canvas margin top.    var _marginBottom = 100; // Canvas margin bottom.    var _canvasWidth;    var _canvasHeight;    var _infoDisplayIntervalSpeed = 50;    var _displayZone = new Array(0,0); // display zone for spatial partitioning.    var _mouseX;     var _mouseY;    var _nickname = '';    var _gridFactor = 2;    var _socket = null;    var _b64cell = 'null';    var _cellimg = 0;    var _joinable = false;    var _drawDetailedCells = true;    var _defaultCellSize = 20; // Standard cell size that is used server side.    /*    *     */    this.init = function(mUtils) {           _socket = io();        _socket.on('app-join', function(data) {            domUtils.updateClients(data);                    });        _socket.on('app-joinable', function(data) {                        if (_joinable !== 'go') {                if (data != 'undefined' && data !== undefined && data === 'go') {                    _joinable = true;                    $('#enter-dialog-nickname').css('border', '1px solid green');                    $('#enter-dialog-button').removeAttr('disabled');                } else {                    _joinable = false;                    $('#enter-dialog-nickname').css('border', '1px solid red');                    $('#enter-dialog-button').attr('disabled', 'disabled');                }            }        });        _socket.on('app-exit', function(data) {            domUtils.updateClients(data);        });        _socket.on('hashmap-draw', function(data) {                        var ht = new HashTable();            var dataArray = data.split('/');            for (var i = 0; i < dataArray.length; i++) {                var cellData = dataArray[i].split('$');                var key = cellData[2] + '$' + cellData[3];                ht.setItem(key.toString(), {                    life:1,                     nickname:cellData[0],                     hexc:cellData[1]                });            }            // draw returns cell count :            var cellCount = draw(getCellsByDisplayZone(ht), _serverCellPopulation);        });        _socket.on('hashmap-append-done', function(data) {            if (data.toString() === _nickname) {                cursorClear();                _allowLibTransfer = true;            }        });        _socket.on('notify-total-cellcount', function(data) {            _serverCellPopulation = data;        });        _socket.on('notify-cellcount-all', function(data) {            domUtils.updateCellcount(data);        });        // Setup canvas.        this.initCanvas('gol_canvas');        this.initGridCanvas('gol_canvas_grid');        window.setInterval(function() {            // Zone info & zone population.            domUtils.setZoneInfo(_displayZone, _zonePopulation);        }, _infoDisplayIntervalSpeed);            };    this.addListeners = function(mouseUtils) {        // Add event listeners for mouse clicks.        _canvas.addEventListener('click', mouseUtils.canvasClicked, false);    };    this.initGridCanvas = function(canvasID) {        var cWidth = $(window).width();        var cHeight = $(window).height();        var gridCanvas = document.getElementById(canvasID);        gridCanvas.height = cHeight;        gridCanvas.width = cWidth;        drawLowerGrid(gridCanvas);    };    /*    * Initialize the canvas.    */    this.initCanvas = function(canvasID) {        var cWidth = $(window).width();        var cHeight = $(window).height();        _canvas = document.getElementById(canvasID);        _canvas.height = cHeight;        _canvas.width = cWidth;        _canvasHeight = cHeight;        _canvasWidth = cWidth;        _gridWidth = _canvasWidth / _cellSize;        _gridHeight = _canvasHeight / _cellSize;        _ctx = _canvas.getContext(_twoD);    };    /*    * Get only visible cells for display/drawing. Depending on which zone the view is on.    * See _displayZone Array : 0,0 or -2,0 or 6,45 for example...    * Iterate through main hashTable's items and select the "diplayable" ones.    */    function getCellsByDisplayZone(ht) {                _population = 0;        var tempHashTable = new HashTable();        // Remove 1 when cell size does not fit grid exactly.        var tempMinGridWidth = (_gridWidth * _displayZone[0]) - 1;        var tempMinGridHeight = (_gridHeight * _displayZone[1]) - 1;        // Add 1 when cell size does not fit grid exactly.        var tempMaxGridWidth = ((_gridWidth * _displayZone[0]) + _gridWidth) + 1;        var tempMaxGridHeight = ((_gridHeight * _displayZone[1]) + _gridHeight) + 1;        for (var cell in ht.items) { // We know the value is always 1 (alive).            var clientNickname = ht.getItem(cell).nickname;            _population = clientNickname === _nickname ? _population + 1 : _population;            var xy = cell.toString().split('$');            var x = parseInt(xy[0]);            var y = parseInt(xy[1])             if (x >= tempMinGridWidth && x <= tempMaxGridWidth &&                y >= tempMinGridHeight && y <= tempMaxGridHeight) {                tempHashTable.setItem(cell, ht.getItem(cell));            }        }        var result = { 'client': hashString(_nickname), 'population': _population };        _socket.emit('notify-cellcount', result);        return tempHashTable;    }    /*    * Draw simple display help grid.    */    function drawLowerGrid(canvas) {        var cWidth = $(window).width();        var cHeight = $(window).height();        var ctx = canvas.getContext(_twoD);        // Draw lower grid :        var squareSize = _defaultCellSize * 1.5; // 20 = default cell size.        ctx.lineWidth = 1;        ctx.strokeStyle = '#F2F2F2'; // light gray :'#E8EAED';        for (var i = 1; i < _gridWidth; ++i) {            // vertical lines :            ctx.beginPath();            ctx.moveTo(i * squareSize, 0);            ctx.lineTo(i * squareSize, cHeight);            ctx.stroke();        }        for (var i = 0; i < _gridHeight; ++i) {            // horizontal lines :            ctx.beginPath();            ctx.moveTo(0, i * squareSize);            ctx.lineTo(cWidth, i * squareSize);            ctx.stroke();        }    }    /*     * Index of array will determine if x ou y value is decremented. O = x, 1 = y.     */    this.decrementZoneDisplay = function(index) {        --_displayZone[index];    };    /**     * Index of array will determine if x ou y value is decremented. O = x, 1 = y.     */    this.incrementZoneDisplay = function(index) {        ++_displayZone[index];    };    this.applyXyFromLibStringValue = function(value) {        var tempLibData = '';        for (var i = 0; i < value.length; ++i) {            if (value[i] == '-') {                tempLibData += '~';            } else {                tempLibData += value[i];            }        }        _xyFromLibStringValue = tempLibData;    };    /**     * Accessors.     */    this.getDefaultCellSize = function() {        return _defaultCellSize;    };    this.isDrawDetailedCells = function() {          return _drawDetailedCells;    };    this.setDrawDetailedCells = function(value) {        _drawDetailedCells = value;    };    this.getCellSize = function() {          return _cellSize;    };    this.setCellSize = function(value) {        _cellSize = value;    };    this.setZonePopulation = function(value) {        _zonePopulation = value;    };    this.getZonePopulation = function() {        return _zonePopulation;    };    this.getCtx = function() {        return _ctx;    };    this.getDisplayZone = function() {        return _displayZone;    };    this.getCanvasWidth = function() {        return _canvasWidth;    };    this.getCanvasHeight = function() {        return _canvasHeight;    };    this.getCanvas = function() {        return _canvas;    };    this.setMouseX = function(x) {        _mouseX = x;    };        this.setMouseY = function(y) {        _mouseY = y;    };    this.getCellColor = function() {        return _cellColor;    };    this.setCellColor = function(value) {        _cellColor = value;    };    this.getNickName = function() {        return _nickname;    };    this.setNickName = function(value) {        _nickname = value;    };    this.getXyFromLibStringValue = function() {        return _xyFromLibStringValue;    };    this.setXyFromLib = function(value) {        _xyFromLib = value;    };        this.setLibTransfer = function(value) {        _libTransfer = value;    };    this.getLibTransfer = function() {        return _libTransfer;    };    this.isAllowLibTransfer = function() {        return _allowLibTransfer;    };    this.setAllowLibTransfer = function(value) {        _allowLibTransfer = value;    };    this.getJoinable = function() {        return _joinable;    };    this.setJoinable = function(value) {        _joinable = value;    };    this.setCellimg = function(value) {        _cellimg = value;    };    this.getCellimg = function() {        return _cellimg;    };    this.setB64cell = function(value) {        _b64cell = value;    };    this.getB64cell = function() {        return _b64cell;    };    this.getSocket = function() {        return _socket;    };    this.getGridHeight = function() {        return _gridHeight;    };    this.setGridHeight = function(value) {        _gridHeight = value;    };    this.getGridWidth = function() {        return _gridWidth;    };    this.setGridWidth = function(value) {        _gridWidth = value;    };}