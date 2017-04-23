/**
 * Append patern to main hashmap in gol.
 */
exports.append = function(gol, data, sanitizer) {

	let appendData = JSON.parse(data);
	let pattern = appendData.pattern.split('~');
	let xy; 

    let mousex = sanitizer.perform(appendData.mousex);
    let mousey = sanitizer.perform(appendData.mousey);
    let color = sanitizer.perform(appendData.color);
    let zx = sanitizer.perform(appendData.zonex);
    let zy = sanitizer.perform(appendData.zoney);
    let gw = sanitizer.perform(appendData.gridW);
    let gh = sanitizer.perform(appendData.gridH);
    let cli = sanitizer.perform(appendData.client);
    let csize = sanitizer.perform(appendData.cellSize);

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