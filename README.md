# test_webrtc

Install node and peerjs:
```bash
curl -sL https://deb.nodesource.com/setup_5.x | bash -
apt-get install -y nodejs
npm install peer
```

Run peerjs server:
```bash
node peer_server.js
```

Run web client:
```bash
python3 -m http.server 9999
```

http://localhost:9999
