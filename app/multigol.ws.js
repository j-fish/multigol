/********************************
 * to lauch from terminal :
node C:\Users\thw\Documents\WEB\multigol\app\multigol.ws.js
 */
console.log("dirname=" + __dirname);
var express = require('express');
var fs = require('fs');
eval(fs.readFileSync(__dirname + '/src/js/dto/multigol.hashstring.js').toString());
eval(fs.readFileSync(__dirname + '/src/js/dto/multigol.client.js').toString());
eval(fs.readFileSync(__dirname + '/src/js/dto/multigol.pattern.js').toString());
var jade = require('jade');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var patternAppender = require('./src/js/srvside/multigol.srvside.append.pattern.js');
var libreader = require('./src/js/srvside/multigol.srvside.libreader.js');
var utils = require('./src/js/srvside/multigol.srvside.utils.js');
var clientUtils = require('./src/js/srvside/multigol.srvside.client.utils.js');
var templateBuilder = require('./src/js/srvside/multigol.srvside.template.builder.js');
var colors = require('colors');
var gol = require('./src/js/srvside/multigol.srvside.js');
var libdata = [];
var clients = [];
var clientCellCount = [];
libreader.buildLibrary(libdata, __dirname + '/src/data/gol-lexicon.txt');
gol.init(io);

/* 
 * Set our default template engine to "jade" which prevents the need 
 * for extensions (although you can still mix and match).
 */
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/src'));

/* http request and http response. */
app.get('/multigol', function(req, res) {
    var template = __dirname + '/src/view/multigol.jade';
    var html = jade.renderFile(template, {library: libdata});
    res.send(html);
});

io.on('connection', function(socket) {

    console.log('|_ a client connected @ '.green + utils.getDateTime());	

    socket.on('app-join-check', function(data) {
        io.emit('app-joinable', clientUtils.checkJoin(
            data, clients) === false ? undefined : 'go');
    });

    socket.on('app-join', function(data) {
        var client = JSON.parse(data);
        clients.push(new User(client.userName, 
            hashString(client.userName), 
            client.hexc, client.cellImg, client.b64img, 
            client.address, client.port));
        var html = templateBuilder.buildClients(jade, clients);
        console.log('|_ client joined: '.cyan + client.userName
            + '-' + utils.getDateTime());
        io.emit('app-join', html);
    });

    socket.on('app-exit', function(data) {
        if (clients.length <= 0) return;
        clients = clientUtils.clearClient(clients, data);
        var html = templateBuilder.buildClients(jade, clients);
        gol.removeCellsByNickname(data);
        console.log('|_ client left: '.magenta + data + 
            ' @ '.magenta + utils.getDateTime());
        io.emit('app-exit', html);
    });

    socket.on('hashmap-append', function(data) {
        console.log('|_ hashmap-append: '.gray + data.toString().gray);
        var client = patternAppender.append(gol, data);
        io.emit('hashmap-append-done', client);
    });

    socket.on('disconnect', function() {
        console.log('|_ user disconnected @ '.magenta + utils.getDateTime());
    });

    socket.on('notify-cellcount', function(data) {
        if (clients.length === 0) return;
        if (clientCellCount.length > clients.length) clientCellCount = [];
        clientCellCount.push(data);
        if (clientCellCount.length === clients.length) {
            var result = JSON.stringify(clientCellCount);
            clientCellCount = [];
            io.emit('notify-cellcount-all', result);
        }
    });

});

http.listen(3000, function() {
    console.log('|_ nodejs multiplayer Game Of Life'.yellow);
    console.log('|_ listening on localhost:3000'.yellow);
});



