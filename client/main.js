




function generateRandomUserID() {
	// Get a 20 character user id
	var code_table = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var user_id = "";
	for (var i = 0; i < 20; ++i) {
		// Get a random number between 0 and 35
		var num = Math.floor((Math.random() * 36));

		// Get the character that corresponds to the number
		user_id += code_table[num];
	}

	return user_id;
}

function httpGetJSON(url, cb, timeout) {
	timeout = timeout || 3000;
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState === 4) {
			cb(this.response, this.status);
		} else if (this.readyState === 0) {
			cb(null);
		}
	};
	xhr.onerror = function() {
		cb(null);
	};
	xhr.open('GET', url, true);
	xhr.responseType = 'json';
	xhr.timeout = timeout;
	xhr.send(null);
}


function logFunction() {
	var copy = Array.prototype.slice.call(arguments).join(' ');
	$('#log').append(copy + '<br>');
}

var g_my_id = null;
var g_peers = [];
var g_server = null;
var g_cons = [];


$(document).ready(function() {
	$('#getPeers').click(function(e) {
		httpGetJSON('http://localhost:9999/peers.json', function(response, status) {
			g_peers = response;
			console.info(g_peers);
		});
	});

	$('#getConnections').click(function(e) {
		for (var i=0; i<g_peers.length; ++i) {
			var peer = g_peers[i];
			if (g_my_id === peer) continue;

			con = g_server.connect(peer, {
				label: 'chat',
				serialization: 'none',
				metadata: {message: 'message'}
			});
			con.on('open', function() {
				console.info('peer outgoing open: ' + con.peer + ', ' + con.label);
				if (con.label === 'chat') {
					con.on('data', function(data) {
						console.info('peer outgoing data: ' + con.peer + ', ' + data);
					});
					con.on('close', function() {
						console.info('peer outgoing closed: ' + con.peer);
					});
				}
			});
			con.on('error', function(err) {
				console.info('error ..................' + con.peer);
				console.error(err);
			});
			g_cons.push(con);
		}
	});

	$('#sendToPeers').click(function(e) {
		var msg = 'ass';
		for (var i=0; i<g_cons.length; ++i) {
			console.info('Sending peer ' + g_cons[i].peer + ': ' + msg);
			g_cons[i].send(msg);
		}
	});

	$('#closeConnections').click(function(e) {
		// Close the connections to the peers
		for (var i=0; i<g_cons.length; ++i) {
			console.info('Closing peer ' + g_cons[i].peer);
			g_cons[i].close();
		}
		g_cons = [];
		g_peers = [];

		// Close the connection to the peer server
		if (!!g_server && !g_server.destroyed) {
			g_server.destroy();
		}
		g_server = null;
		g_my_id = null;
	});

	// Create a random user id
	var id = generateRandomUserID();

	// Connect to the peer server
	server = new Peer(id, {
		host: 'localhost',
		port: 9000,
		path: '/myapp',
		debug: 3,
		logFunction: logFunction
	});

	// Handle connection to peer server
	server.on('open', function(id) {
		console.info('server open: ' + id);
		g_my_id = id;
		$('#pid').text(g_my_id);
	});

	// Handle connections from peers
	server.on('connection', function(con) {
		console.info('peer incoming open: ' + con.peer + ', ' + con.label);
		con.on('data', function(data) {
			console.info('peer incoming data: ' + data);
		});
		con.on('close', function() {
			console.info('peer incoming closed: ' + con.peer);
		});
	});

	server.on('error', function(err) {
		console.log(err);
	});
	g_server = server;
});


