/********************************
 * to lauch from terminal :
node C:\Users\thw\Documents\WEB\multigol\app\multigol.ws.js
 */
console.log("dirname=" + __dirname);
/*************************************************
* Variables.
**************************************************/
var express = require('express');
var fs = require('fs');
var jade = require('jade');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var libreader = require('./src/js/srvside/multigol.libreader.js');
var utils = require('./src/js/srvside/multigol.srvside.utils.js');
var colors = require('colors');
var gol = require('./src/js/srvside/multigol.srvside.js');
var libdata = [];
var clients = [];
var clientCellCount = [];
libreader.BuildLibrary(libdata, __dirname + '/src/data/gol-lexicon.txt');
gol.Init(io);

/* 
 * Set our default template engine to "jade" which prevents the need 
 * for extensions (although you can still mix and match).
 */
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/src'));

/**
 * http request and http response.
 */
app.get('/', function(req, res) {
    var template = __dirname + '/src/view/multigol.jade';
    var html = jade.renderFile(template, {library: libdata});
    res.send(html);
});
/* END HTTP REQ RES. */

io.on('connection', function(socket) {

    console.log('|_ a client connected @ '.green + utils.GetDateTime());	

    socket.on('hashmap-append', function(data) {

        // append data to global hash map:
        console.log('|_ hashmap-append: '.gray + data.toString().gray);
        var lib = data.split('~');
        var mousex = lib[0];
        var mousey = lib[1];
        var cellSize = lib[2];
        var zonex = lib[3];
        var zoney = lib[4];
        var gridW = lib[5];
        var gridH = lib[6];
        var color = lib[7];
        var client = lib[8];

        for (var i = 9; i < lib.length; i++) {    
            var xy = lib[i].split('$');
            gol.IORunLibInput(mousex, mousey, xy[0], xy[1], color, zonex, zoney, gridW, gridH, client, cellSize);
        }

        io.emit('hashmap-append-done', client);
    });

    socket.on('hashmap-append-done', function(data) {});

    socket.on('app-join-check', function(data) {

        console.log('|_ checking nickname '.gray + data + ' is joinable'.gray);
        var joinable = true;
        for (var i = 0; i < clients.length; i++) {
            var client = clients[i].split('$');
            if (data == 'undefined' || data === undefined || 
                data === null || client[0] == data) {
                joinable = false;
                break;
            }
        }

        io.emit('app-joinable', joinable === false ? undefined : 'go');
    });

    socket.on('app-join', function(data) {

        clients.push(data);
        var templateData = [];
        for (var i = 0; i < clients.length; i++) {
            var client = clients[i].split('$');
            var l = templateData.push({
                'nickname':client[0], 
                'nicknamehash':utils.HashCode(client[0]),
                'hexc':client[1],
                'cellimg':client[2],
                'b64img':client[3]
            });
        }

        client = data.split('$');
        console.log('|_ client joined: '.cyan + client[0] + '-' + 
            client[1].toString() + '-' + client[2].toString() +
            ' @ '.cyan + utils.GetDateTime());

        var template = __dirname + '/src/view/clients.jade';
        var html = jade.renderFile(template, {clients: templateData});

        io.emit('app-join', html);
    });

    socket.on('app-exit', function(data) {

        if (clients.length > 0) {

            var index = clients.indexOf(data);
            var clientToRemove = clients[index].split('$');
            if (index > -1) {
                clients.splice(index, 1);
            }
            var templateData = [];
            for (var i = 0; i < clients.length; i++) {
                var client = clients[i].split('$');
                templateData.push({
                    'nickname':client[0], 
                    'nicknamehash':utils.HashCode(client[0]),
                    'hexc':client[1],
                    'cellimg':client[2],
                    'b64img':client[3]
                });
            }

            // remove all cell of client color, then emit.
            gol.RemoveCellsByNickname(clientToRemove[0].toString());
            
            var client = data.split('$');
            console.log('|_ client left: '.magenta + client[0] + '-' + 
                client[1].toString() + '-' + client[2].toString() +
                ' @ '.magenta + utils.GetDateTime());
        
            var template = __dirname + '/src/view/clients.jade';
            var html = jade.renderFile(template, {clients: templateData});
            io.emit('app-exit', html);
        }
    });
    
    socket.on('notify-cellcount', function(data) {

        if (clients.length === 0) {
            return;
        } 

        if (clientCellCount.length > clients.length) {
            clientCellCount = [];
        }

        clientCellCount.push(data);

        if (clientCellCount.length === clients.length) {
            var result = JSON.stringify(clientCellCount);
            clientCellCount = [];
            io.emit('notify-cellcount-all', result);
        }
    });

    socket.on('notify-tchat', function(data) {
        io.emit('notify-tchat-all', data);
    });

    socket.on('notify-total-cellcount', function(data) {
    });

    socket.on('disconnect', function() {
        console.log('|_ user disconnected @ '.magenta + utils.GetDateTime());
    });

});

/**
 *
 */
http.listen(3000, function() {
    console.log('|_ nodejs multiplayer Game Of Life'.random);
    console.log('|_ listening on localhost:3000'.random);
});



