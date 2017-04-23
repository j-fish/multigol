/*************************************************
 * Drawing functions.
 **************************************************/
/*
 * Draw all visible cells.
 */
function draw(ht, totalCells) {

    // Reset zone population.
    gol.setZonePopulation(0);
    let imgHt = new HashTable();
    let ctx = gol.getCtx();
    let cellSize = gol.getCellSize();
    let displayZone = gol.getDisplayZone();
    let gridWidth = gol.getGridWidth();
    let gridHeight = gol.getGridHeight();
    let zonePopulation = gol.getZonePopulation();
    ctx.clearRect(0, 0, gol.getCanvasWidth(), gol.getCanvasHeight());
    let image = null;
    let xy;
    let clientNickname;
    let clientNicknameHash;
    let painted;
    let elem;
    let cellimg;

    for (var cell in ht.items) {

    	xy = cell.toString().split('$');
        clientNickname = ht.getItem(cell).nickname;
        clientNicknameHash = hashString(ht.getItem(cell).nickname);
        painted = false;
        elem = document.getElementById('is-client-icon-' + clientNicknameHash);
        
        if (elem != null) cellimg = elem.innerText || elem.textContent;

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

                if (painted === false) imgHt.setItem(clientNickname, image);
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
};