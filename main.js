

var peer = null;


// Handle a connection object.
function connect(c) {
	// Handle a chat connection.
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

$(document).ready(function() {
	var peer_id = null;
	var use_public_server = false;

	var logFunction = function() {
		var copy = Array.prototype.slice.call(arguments).join(' ');
		$('#log').append(copy + '<br>');
	};

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

