
// Connect to PeerJS, have server assign an ID instead of providing one
// Showing off some of the configs available with PeerJS :).
var peer = new Peer({
	key: 'x7fwx2kavpy6tj4i',
	debug: 3,
	logFunction: function() {
		var copy = Array.prototype.slice.call(arguments).join(' ');
		$('#log').append(copy + '<br>');
	}
});
var connectedPeers = {};

function doNothing(e) {
	e.preventDefault();
	e.stopPropagation();
}

// Handle a connection object.
function connect(c) {
	// Handle a chat connection.
	if (c.label === 'chat') {
		var chatbox = $('<div></div>').addClass('connection').addClass('active').attr('id', c.peer);
		var header = $('<h1></h1>').html('Chat with <strong>' + c.peer + '</strong>');
		var messages = $('<div><em>Peer connected.</em></div>').addClass('messages');
		chatbox.append(header);
		chatbox.append(messages);

		// Select connection handler.
		chatbox.on('click', function() {
			if ($(this).attr('class').indexOf('active') === -1) {
				$(this).addClass('active');
			} else {
				$(this).removeClass('active');
			}
		});
		$('#connections').append(chatbox);

		c.on('data', function(data) {
			messages.append('<div><span class="peer">' + c.peer + '</span>: ' + data + '</div>');
		});
		c.on('close', function() {
			alert(c.peer + ' has left the chat.');
			chatbox.remove();
			delete connectedPeers[c.peer];
		});
	} else if (c.label === 'file') {
		c.on('data', function(data) {
			// If we're getting a file, create a URL for it.
			if (data.constructor === ArrayBuffer) {
				var dataView = new Uint8Array(data);
				var dataBlob = new Blob([dataView]);
				var url = window.URL.createObjectURL(dataBlob);
				$('#' + c.peer).find('.messages').append('<div><span class="file">' +
				c.peer + ' has sent you a <a target="_blank" href="' + url + '">file</a>.</span></div>');
			}
		});
	}
	connectedPeers[c.peer] = 1;
}

function eachActiveConnection(fn) {
	var actives = $('.active');
	var checkedIds = {};
	actives.each(function() {
		var peerId = $(this).attr('id');

		if (! checkedIds[peerId]) {
			var conns = peer.connections[peerId];
			for (var i = 0, ii = conns.length; i < ii; i += 1) {
				var conn = conns[i];
				fn(conn, $(this));
			}
		}

		checkedIds[peerId] = 1;
	});
}

// Show this peer's ID.
peer.on('open', function(id){
	$('#pid').text(id);
});

// Await connections from others
peer.on('connection', connect);

peer.on('error', function(err) {
	console.log(err);
});

$(document).ready(function() {
	// Prepare file drop box.
	var box = $('#box');
	box.on('dragenter', doNothing);
	box.on('dragover', doNothing);
	box.on('drop', function(e) {
		e.originalEvent.preventDefault();
		var file = e.originalEvent.dataTransfer.files[0];
		eachActiveConnection(function(c, $c) {
			if (c.label === 'file') {
				c.send(file);
				$c.find('.messages').append('<div><span class="file">You sent a file.</span></div>');
			}
		});
	});

	// Connect to a peer
	$('#connectToPeer').click(function() {
		var requestedPeer = $('#rid').val();
		if (! connectedPeers[requestedPeer]) {
			// Create 2 connections, one labelled chat and another labelled file.
			var c = peer.connect(requestedPeer, {
				label: 'chat',
				serialization: 'none',
				metadata: {message: 'hi i want to chat with you!'}
			});
			c.on('open', function() {
				connect(c);
			});
			c.on('error', function(err) {
				alert(err);
			});

			var f = peer.connect(requestedPeer, { label: 'file', reliable: true });
			f.on('open', function() {
				connect(f);
			});
			f.on('error', function(err) {
				alert(err);
			});
		}
		connectedPeers[requestedPeer] = 1;
	});

	// Close a connection.
	$('#closeAConnection').click(function() {
		eachActiveConnection(function(c) {
			c.close();
		});
	});

	// Send a chat message to all active connections.
	$('#sendToPeers').submit(function(e) {
		e.preventDefault();
		// For each active connection, send the message.
		var msg = $('#messageToSend').val();
		eachActiveConnection(function(c, $c) {
			if (c.label === 'chat') {
				c.send(msg);
				$c.find('.messages').append('<div><span class="you">You: </span>' + msg + '</div>');
			}
		});
		$('#messageToSend').val('');
		$('#messageToSend').focus();
	});
});

// Clean up any connections when the page unloads
window.onunload = window.onbeforeunload = function(e) {
	if (!!peer && !peer.destroyed) {
		peer.destroy();
	}
};
