/*************************************************
 * Drawing functions.
 **************************************************/
/*
 * Draw all visible cells.
 */
function Draw(ht, totalCells) {

    // Reset zone population.
    gol.setZonePopulation(0);
    var imgHt = new HashTable();
    var ctx = gol.getCtx();
    var cellSize = gol.getCellSize();
    var displayZone = gol.getDisplayZone();
    var gridWidth = gol.getGridWidth();
    var gridHeight = gol.getGridHeight();
    var zonePopulation = gol.getZonePopulation();
    ctx.clearRect(0, 0, gol.getCanvasWidth(), gol.getCanvasHeight());
    var image = null;
    var xy;

    for (var cell in ht.items) {

    	xy = cell.toString().split('$');
        var clientNickname = ht.getItem(cell).nickname;
        var clientNicknameHash = HashCode(ht.getItem(cell).nickname);

        var elem = document.getElementById('is-client-icon-' + clientNicknameHash);
        if (elem != null) {
            var cellimg = elem.innerText || elem.textContent;
        }
        var painted = false;

        if (gol.isDrawDetailedCells()) {
        
            // = 0 if no image to draw else > 0
            if (cellimg != null && cellimg != undefined && parseInt(cellimg) > 0) {

                // draw img :
                if (imgHt.hasItem(clientNickname)) {
                    image = imgHt.getItem(clientNickname);
                    painted = true;
                } else {
                    image = new Image();
                    image.src = document.getElementById('client-icon-' + clientNicknameHash).src;
                }

                ctx.drawImage(image,
                    parseInt(((parseInt(xy[0]) - (gridWidth * displayZone[0])) * cellSize)), 
                    parseInt(((parseInt(xy[1]) - (gridHeight * displayZone[1])) * cellSize)), 
                    cellSize, cellSize);

                if (painted === false) {
                    imgHt.setItem(clientNickname, image);
                }
                painted = false;

            } else {
                // draw square.
                ctx.fillStyle = ht.getItem(cell).hexc;
                ctx.fillRect(((parseInt(xy[0]) - (gridWidth * displayZone[0])) * cellSize),
                    ((parseInt(xy[1]) - (gridHeight * displayZone[1])) * cellSize), 
                    cellSize, cellSize);
            }
        } else {
            // draw all squares as black: < 4 in size.
            ctx.fillStyle = 'black'
            ctx.fillRect(((parseInt(xy[0]) - (gridWidth * displayZone[0])) * cellSize),
                ((parseInt(xy[1]) - (gridHeight * displayZone[1])) * cellSize), 
                cellSize, cellSize);
        }

        ++zonePopulation;
    }
    
    imgHt.clear();
    // Update gol informations :
    $('#gol-status-data-universpop').text('universe population: ' + totalCells);
    $('#gol-status-data-xy').text('virtual zone: x=' + gol.getDisplayZone()[0] + ' y=' + gol.getDisplayZone()[1]);
    $('#gol-status-data-framepop').text('frame population: ' + zonePopulation);
    $('#gol-status-data-cellsize').text('cell size: ' + cellSize);
    // Set zone or frame population :
    gol.setZonePopulation(zonePopulation);
    return totalCells;
}


