/*
* Gol library associated functions.
*/
/*
* Simply display library element.
*/
function displayLib() {
    $('#gol-library').css('display') == 'none' ? 
        $('gol-library').show() : $('gol-library').hide();
}

/*
* Display or hide the pattern description on mouseover.
*/
function displayPatternDescrition(id) {
    $('#' + id).css('display') == 'none' ?
        $('#' + id).show() : $('#' + id).hide();
}

/*
* Get pattern from lib. Events drag & drop simulation.
*/
function getGolLibPattern(patternId, linkId) {

    if (gol.isAllowLibTransfer() === false) {
        return;
    }

    // Get coordiantes.
    var pattern = $('#' + patternId).text();
    gol.applyXyFromLibStringValue(pattern);
    gol.setXyFromLib(pattern.split('-')); // get all the coordinates.
    gol.setLibTransfer(true); // transfering is true.
    cursorCopy();
    // Set link as visited.
    $('#' + linkId).css({ 'background-color': '#7DE3D7'});
}