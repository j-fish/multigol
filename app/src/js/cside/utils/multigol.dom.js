/**
 * Dom utils class
 */
var DOMUtils = function DOM() {

	/*
	 * Display zone information.
	 */
	this.setZoneInfo = function(displayZone, zonePopulation) {
	    $('#zone').text('spatial zone: x' + displayZone[0].toString() + '-y' + displayZone[1].toString());
	    $('#population').text('zone population: ' + zonePopulation.toString());
	}

	/*
	* Update new clients.
	*/
	this.updateClients = function(data) {
		$('#multigol-clients').html('');
		$('#multigol-clients').html(data);
	}

	/**
	 * Update cell count by client.
	 */ 
	this.updateCellcount = function(data) {

		var cellcounts = JSON.parse(data);
		for (var i = 0; i < cellcounts.length; ++i) {
			var count = cellcounts[i];
			$('#multigol-client-cellcount' + count.client).html(' -> cell count: ' + 
				count.population);
		}
	}

}