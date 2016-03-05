
var PeerServer = require('peer').PeerServer;
var server = PeerServer({port: 9000, path: '/myapp'});
var g_ids = {};

server.on('connection', function(id) {
	console.info('open: ' + id);
	g_ids[id] = 1;
});

server.on('disconnect', function(id) {
	console.info('close: ' + id);
	delete g_ids[id];
});


var express = require('express');
var app = express();

app.use(express.static('client'));

app.get('/peers.json', function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(Object.keys(g_ids)));
});

app.listen(9999, function () {
	console.log('Server running at http://localhost:9999');
});




