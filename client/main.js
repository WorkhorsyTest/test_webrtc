




function connect(c) {
	// Handle a chat connection
	if (c.label === 'chat') {
		c.on('data', function(data) {
			console.info('data: ' + data);
		});
		c.on('close', function() {
			console.info(c.peer + ' has left the chat.');
		});
		//console.info(c);
	}
}

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
			if (g_my_id === g_peers[i]) return;

			var peer = g_peers[i];
			console.info(peer);

			con = g_server.connect(peer, {
				label: 'chat',
				serialization: 'none',
				metadata: {message: 'message'}
			});
			con.on('open', function() {
				console.info('open chat ..................' + con.peer);
				connect(con);
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
			g_cons[i].send(msg);
		}
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
	server.on('connection', function(c) {
		console.info('peer open: ' + c.peer);
		c.on('data', function(data) {
			console.info('peer data: ' + data);
		});
		c.on('close', function() {
			console.info('peer closed: ' + c.peer);
		});
	});

	server.on('error', function(err) {
		console.log(err);
	});
	g_server = server;
});
/*
$(document).ready(function() {
	httpGet('http://localhost:9999/peers.json', function(response, status) {
		console.info(response);
	});
	var peer_id = null;
	var use_public_server = false;

	if (use_public_server) {
		peer = new Peer({
			key: 'x7fwx2kavpy6tj4i',
			debug: 3,
			logFunction: logFunction
		});
	} else {
		// Create a random user id
		var id = generateRandomUserID();
		peer = new Peer(id, {
			host: 'localhost',
			port: 9000,
			path: '/myapp',
			debug: 3,
			logFunction: logFunction
		});
	}

	peer.on('open', function(id) {
		console.info('open ..................' + id);
		//$('#pid').text(id);
		peer_id = id;
		$('#pid').text(peer_id);
	});

	// Await connections from others
	peer.on('connection', connect);

	peer.on('error', function(err) {
		console.log(err);
	});

	var g_con = null;
	$('#openConnection').click(function(e) {
		var requestedPeer = $('#rid').val();
		g_con = peer.connect(requestedPeer, {
			label: 'chat',
			serialization: 'none',
			metadata: {message: 'message'}
		});
		g_con.on('open', function() {
			console.info('open chat ..................' + g_con.peer);
			connect(g_con);
		});
		g_con.on('error', function(err) {
			console.info('error ..................' + g_con.peer);
			console.error(err);
		});
	});

	$('#closeConnection').click(function(e) {
		g_con.close();
	});

	// Send a chat message to all active connections.
	$('#sendToPeers').click(function(e) {
		var msg = $('#messageToSend').val();
		g_con.send(msg);
	});
});

// Clean up any connections when the page unloads
window.onunload = window.onbeforeunload = function(e) {
	if (!!peer && !peer.destroyed) {
		peer.destroy();
	}
};
*/

