/** 
 * Build all clients.
 */
exports.buildClients = function(jade, clients) {

	let fs = require('fs');
	eval(fs.readFileSync(__dirname + '/../dto/multigol.client.js').toString());
	let templateData = [];
	let l;

    for (var i = 0; i < clients.length; i++) {            
        l = templateData.push({
            'nickname': clients[i].getUserName(), 
            'nicknamehash': clients[i].getUserNameHash(),
            'hexc': clients[i].getHexc(),
            'cellimg': clients[i].getCellImg(),
            'b64img': clients[i].getBase64img()
        });
    }

    let template = __dirname + '/../../view/clients.jade';
    let html = jade.renderFile(template, {clients: templateData});

    return html;
}