/**
 * Drawing & playing with patterns utils.
 */
var PatternUtils = function PatternUtils() {

	var MAX_INT = 1000000000000; // 10^12
    var MIN_INT = -1000000000000; // -10^12

	this.getMinMaxYX = function(ht) {

        var a = new Array(4);        
        var minX = MAX_INT, minY = MAX_INT, maxX = MIN_INT, maxY = MIN_INT;

        for (var cell in ht.items) {
            xy = cell.toString().split('$');
            minX = parseInt(xy[0]) < minX ? parseInt(xy[0]) : minX;
            maxX = parseInt(xy[0]) > maxX ? parseInt(xy[0]) : maxX;
            minY = parseInt(xy[1]) < minY ? parseInt(xy[1]) : minY;
            maxY = parseInt(xy[1]) > maxY ? parseInt(xy[1]) : maxY;
        }   

        a[0] = minX;
        a[1] = minY;
        a[2] = maxX;
        a[3] = maxY;

        return a;
    };

    this.draw = function(x, y, ctx, gol) {

    	var image;
    	var cellSize = gol.getCellSize();
    	var clientNicknameHash = hashString(gol.getNickName());
    	var elem = document.getElementById('is-client-icon-' + clientNicknameHash);        
        if (elem != null) var cellimg = elem.innerText || elem.textContent;

        if (gol.isDrawDetailedCells()) {
        
            // = 0 if no image to draw else > 0
            if (cellimg != null && cellimg != undefined && parseInt(cellimg) > 0) {

                // draw img :
                image = new Image();
                image.src = document.getElementById('client-icon-' + clientNicknameHash).src;
                ctx.drawImage(image, parseInt(x * cellSize), parseInt(y * cellSize), 
                    cellSize, cellSize);

            } else {

                // draw square.
                ctx.fillStyle = gol.getCellColor();
                ctx.fillRect(parseInt(x * cellSize), parseInt(y * cellSize), 
                    cellSize, cellSize);
            }

        } else {
            // draw all squares as black: < 4 in size.
            ctx.fillStyle = 'black'
            ctx.fillRect(parseInt(x * cellSize), parseInt(y * cellSize), 
                cellSize, cellSize);
        }

    };

    this.drawField = function(a, ctx, gol) {

        ctx.beginPath();
        ctx.lineWidth = '1';
        ctx.strokeStyle = 'cyan';
        ctx.rect(
            Math.floor((parseInt(a[0]) * gol.getCellSize()) - 3), 
            Math.floor((parseInt(a[1]) * gol.getCellSize()) - 3), 
            Math.floor(((parseInt(a[2] - a[0]) + 1) * gol.getCellSize()) + 6), 
            Math.floor(((parseInt(a[3] - a[1]) + 1) * gol.getCellSize()) + 6)
        );
        
        ctx.stroke();
    };

    this.clearCanvas = function(ctx, canvas) {
    	ctx.clearRect(0, 0, canvas.width, canvas.height);
    	ctx.fillStyle = 'rgba(130,120,120,' + 0.7 + ')';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    this.formatCell = function(x, y) {
    	return x.toString() + '$' + y.toString();
    };

    this.buildMatrix = function(w, h) {
        var m = new Array(w);
        for (var i = 0; i < w; i++) m[parseInt(i)] = new Array(parseInt(h));
        return m;        
    };

    this.logM = function(m, w, h) {

        var s = '';
        for (var y = 0; y < w; y++) {
            for (var x = 0; x < h; x++) s += m[x][y] === true ? 'X' : ' ';
            s += '\n';
        }

        console.log('\n' + s);
    };

}