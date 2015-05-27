webrtc-connect
==============

> Establish WebRTC Data Channels between browser-node and node-node with a TCP/HTTP/WebSockets "createServer/attach" like interface

# Badgers

# Why no use WebSockets instead?

WebRTC provides a set of different features, one of them being confidentiality, that is, [WebRTC Data Channels are encrypted by default][1] and can't be eavesdropped, while for WebSockets, [we need first to set up TLS/SSL][2].

# Usage

### Client

Works in node.js and in the browser(one that supports WebRTC that is :))
 with browserify or by including the standalone file `webrtc-connect.min.js` which exports a `rtcc` object to window.

```javascript
var rtcc = require('webrtc-connect');

rtcc.connect({url: 'http://localhost', port: 9999}, function(err, channel) {
    if (err)
        return console.log('err', err);
    channel.send('hey! how are you?');
    channel.on('data', function(data){
        console.log('received message - ', data);
    });
    
});
```

### Server

Boot a fresh http server to establish the connection:
```javascript
var rtcc = require('webrtc-connect');

rtcc.createServer(function(channel){
    channel.on('data', function(data){
        console.log('received message - ', data);
        channel.send('good and you?');
    });

}).listen('9999');
```

Attach to an existing http server of your app:
```javascript
var rtcc = require('webrtc-connect');

rtcc.createServer(function(channel){
    channel.on('data', function(data){
        console.log('received message - ', data);
        channel.send('good and you?');
    });

}).attach(EXISTING_HTTP_SERVER);
```


[1]: http://sporadicdispatches.blogspot.pt/2013/06/webrtc-security-and-confidentiality.html
[2]: https://msdn.microsoft.com/en-us/library/windows/apps/hh761446.aspx
