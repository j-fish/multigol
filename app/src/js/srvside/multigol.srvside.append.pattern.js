/**
 * Append patern to main hashmap in gol.
 */
exports.append = function(gol, data, sanitizer) {

	var appendData = JSON.parse(data);
	var pattern = appendData.pattern.split('~');
	var xy; 

    var mousex = sanitizer.perform(appendData.mousex);
    var mousey = sanitizer.perform(appendData.mousey);
    var color = sanitizer.perform(appendData.color);
    var zx = sanitizer.perform(appendData.zonex);
    var zy = sanitizer.perform(appendData.zoney);
    var gw = sanitizer.perform(appendData.gridW);
    var gh = sanitizer.perform(appendData.gridH);
    var cli = sanitizer.perform(appendData.client);
    var csize = sanitizer.perform(appendData.cellSize);

	for (var i = 0; i < pattern.length; i++) {    
        xy = pattern[i].split('$');
        gol.iORunLibInput(mousex, mousey, 
            sanitizer.perform(xy[0]), 
            sanitizer.perform(xy[1]), 
        	color, zx, zy, gw, gh, cli, csize
        );
    }

    return appendData.client;
}