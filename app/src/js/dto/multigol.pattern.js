/** 
 * User/client properties.
 */
var Pattern = function Pattern(mousex, mousey, cellSize, zonex, zoney, gridW, 
    gridH, color, client, pattern) {

    var _mousex = mousex;
    var _mousey = mousey
    var _cellSize = cellSize;
    var _zonex = zonex;
    var _zoney = zoney;
    var _gridW = gridW;
    var _gridH = gridH;
    var _color = color;
    var _client = client; 
    var _pattern = pattern;

    this.toJSON = function() {
        
        return JSON.stringify({ 
            mousex: _mousex,
            mousey: _mousey,
            cellSize: _cellSize,
            zonex: _zonex,
            zoney: _zoney,
            gridH: _gridH,
            gridW: _gridW,
            color: _color,
            client: _client,
            pattern: _pattern
        });
    };

    this.getMouseX = function() {
        return _mousex;
    };

    this.setMouseX = function(value) {
        _mousex = value;
    };

    this.getMouseY = function() {
        return _mousey;
    };

    this.setMouseY = function(value) {
        _mousey = value;
    };

    this.getCellSize = function() {
        return _cellSize;
    };

    this.setCellSize = function(value) {
        _cellSize = value;
    };

    this.getZoneX = function() {
        return _zonex;
    };

    this.setZoneX = function(value) {
        _zonex = value;
    };

    this.getZoneY = function() {
        return _zoney;
    };

    this.setZoneY = function(value) {
        _zoney = value;
    };

    this.getGridH = function() {
        return _gridH;
    };

    this.setGridH = function(value) {
        _gridH = value;
    };

    this.getGridW = function() {
        return _gridW;
    };

    this.setGridW = function(value) {
        _gridW = value;
    };

    this.getColor = function() {
        return _color;
    };

    this.setColor = function(value) {
        _color = value;
    };

    this.getClient = function() {
        return _client;
    };

    this.setClient = function(value) {
        _client = value;
    };

    this.getPattern = function() {
        return _pattern;
    };

    this.setPattern = function(value) {
        _pattern = value;
    };

}