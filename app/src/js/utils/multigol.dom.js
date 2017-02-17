/**
 * Dom utils class
 */
var DOMUtils = function DOM() {

	/*
	 * Display zone information.
	 */
	this.SetZoneInfo = function(displayZone, zonePopulation) {
	    $('#zone').text('spatial zone: x' + displayZone[0].toString() + '-y' + displayZone[1].toString());
	    $('#population').text('zone population: ' + zonePopulation.toString());
	}

	/*
	* Update new clients.
	*/
	this.UpdateClients = function(data) {
		$('#multigol-clients').html('');
		$('#multigol-clients').html(data);
	}

	/**
	 * Update cell count by client.
	 */ 
	this.UpdateCellcount = function(data) {

		var cellcounts = JSON.parse(data);
		for (var i = 0; i < cellcounts.length; ++i) {
			var count = cellcounts[i];
			$('#multigol-client-cellcount' + count.client).html('>> cell count: ' + 
				count.population);
		}
	}

	/*
	*
	*/
	this.UpdateTchat = function(data) {

		var tchatmsg = JSON.parse(data);
        var msgHtml = '<div class="multigol-client">'; 
        if (tchatmsg.hexc == undefined) {
        	msgHtml += '<img class="multigol-client-icon" src="' + tchatmsg.base64 + '"/>';
        } else {
        	msgHtml += '<div class="multigol-client-color" style="background-color:' + tchatmsg.hexc + '"></div>';
        }
        msgHtml += '<div class="multigol-client-nickname"><b>' + tchatmsg.nickname + ' >></b>';
        msgHtml += '<span class="tchat-msg-text">' + tchatmsg.msg + '</span></div>';
        msgHtml += '</div>';
		$('#multigol-tchat-conatiner').append(msgHtml);
	}

} // End class.