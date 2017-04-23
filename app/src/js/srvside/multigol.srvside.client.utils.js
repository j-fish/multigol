/**
 * Check if client joignable.
 */
exports.checkJoin = function(userName, clients) {

	console.log('|_ checking nickname '.black + userName);
    let joinable = true;
    for (var i = 0; i < clients.length; i++) {
        if (userName == 'undefined' || userName === undefined || 
            userName === null || clients[0].getUserName() == userName) {
            joinable = false;
            break;
        }
    }

    return joinable;
}

/** 
 * Remove client.
 */
exports.clearClient = function(clients, userName) {

    let fs = require('fs');
    eval(fs.readFileSync(__dirname + '/../dto/multigol.hashstring.js').toString());

    let index = -1;
    for (var i = 0; i < clients.length; i++) {  
        if (clients[i].getUserName() == userName) index = i;
    }

    if (index > -1) {
        clients.splice(index, 1);
    }

    return clients;
}
