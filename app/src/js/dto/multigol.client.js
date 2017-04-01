/** 
 * User/client properties.
 */
var User = function User(userName, userNameHash, hexc, cellimg, b64img, address, port, universe) {

    var _userName = userName;
    var _userNameHash = userNameHash;
    var _hexc = hexc;
    var _cellImg = cellimg;
    var _b64img = b64img;
    var _address = address;
    var _port = port;
    var _universe = universe;

    this.getUserName = function() {
        return _userName;
    };

    this.setUserName = function(value) {
        _userName = value;
    };

    this.getUserNameHash = function() {
        return _userNameHash;
    };

    this.setUserNameHash = function(value) {
        _userNameHash = value;
    };

    this.getCellImg = function() {
        return _cellImg;
    };

     this.setCellImg = function(value) {
        _cellImg = value;
    };

    this.getHexc = function() {
        return _hexc;
    };

     this.setHexc = function(value) {
        _hexc = value;
    };

    this.getBase64img = function() {
        return _b64img;
    };

     this.setBase64img = function(value) {
        _b64img = value;
    };

    this.getAddress = function() {
        return _address;
    };

     this.setAddress = function(value) {
        _address = value;
    };

    this.getPort = function() {
        return _port;
    };

    this.setPort = function(value) {
        _port = value;
    };

    this.getUniverse = function() {
        return _universe;
    };

    this.toJSON = function() {
        
    	return JSON.stringify({ 
    		userName: _userName,
            userNameHash: _userNameHash,
            hexc: _hexc,
            cellImg: _cellImg,
            b64img: _b64img,
    		userAddress: _address,
    		userPort: _port,
            universe: _universe
    	});
    };

}