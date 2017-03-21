/** 
 * Build all clients.
 */
exports.buildClients = function(jade, clients) {

	var fs = require('fs');
	eval(fs.readFileSync(__dirname + '/../dto/multigol.client.js').toString());
	var templateData = [];
	
    for (var i = 0; i < clients.length; i++) {            
        var l = templateData.push({
            'nickname': clients[i].getUserName(), 
            'nicknamehash': clients[i].getUserNameHash(),
            'hexc': clients[i].getHexc(),
            'cellimg': clients[i].getCellImg(),
            'b64img': clients[i].getBase64img()
        });
    }

    var template = __dirname + '/../../view/clients.jade';
    var html = jade.renderFile(template, {clients: templateData});

    return html;
}