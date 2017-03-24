/**
 * Append patern to main hashmap in gol.
 */
exports.append = function(gol, data, sanitizer) {

	var appendData = JSON.parse(data);
	var pattern = appendData.pattern.split('~');
	var xy; 

	for (var i = 0; i < pattern.length; i++) {    
        xy = pattern[i].split('$');
        gol.iORunLibInput(
            appendData.mousex, 
            appendData.mousey, 
            xy[0], 
            xy[1], 
        	appendData.color, 
            appendData.zonex, 
            appendData.zoney, 
        	appendData.gridW, 
            appendData.gridH, 
            appendData.client, 
        	appendData.cellSize
        );
    }

    return appendData.client;
}