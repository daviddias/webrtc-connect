var SimplePeer = require('simple-peer');
var http = require('http');
var url = require('url');
var request = require('request');
var corsify = require('corsify');

exports = module.exports;

exports.createServer = Server;

function Server(callback) {
    if (typeof window !== 'undefined') {
        return callback(new Error('Can not create server on the browser'));
    } 

    if (! (this instanceof Server)) {
        return new Server(callback);
    }
   
    var wrtc = require('wrtc');

    var self = this;

    self.listen = function(port, ip) {
        self.freshServer = true;  
        var http = require('http');
        var httpServer = http.createServer();
       
        httpServer.on('request', function(req, res) {
            
            // CORS should not be done this way :) 
            var origin = req.headers.origin
            res.setHeader('Access-Control-Allow-Origin', origin)

            res.setHeader('Access-Control-Allow-Methods',
                'POST, OPTIONS')
            res.setHeader('Access-Control-Allow-Credentials', 'true')
            res.setHeader('Access-Control-Max-Age', '86400')
            res.setHeader('Access-Control-Allow-Headers',
                'X-Requested-With, Content-Type, Accept')

            if (req.method === 'OPTIONS') {
                return res.end()
            }

        });


        self.attach(httpServer);
                  
        httpServer.listen(port, ip || '127.0.0.1');
    };

    self.attach = function (httpServer) {
        httpServer.on('request', function(req, res) {
            var path = url.parse(req.url).pathname;
            if (req.method === 'POST' && path === '/webrtc-connect') {
                
                var peer = new SimplePeer({ 
                    initiator: false, 
                    trickle: false,
                    wrtc: wrtc
                });

                peer.on('signal', function(offer) {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.write(JSON.stringify(offer), 'utf8');
                    res.end()
                });
                
                peer.on('connect', function(){
                    callback(null, peer);
                });

                var data = '';
                
                req.on('data', function (chunk) {
                    data += chunk.toString();
                });

                req.on('end', function () {
                    peer.signal(JSON.parse(data));
                });
            } else if (self.freshServer && req.method !== 'OPTIONS') {
                res.writeHead(404);
                res.end();
            }
        }); 
    };
}

exports.connect = function Client(opts, callback) {
  
    var wrtc;
    if (typeof window === 'undefined') {
        wrtc = require('wrtc');
    } 

    var peer = new SimplePeer({
        initiator: true,
        trickle: false,
        wrtc: wrtc
    });

    peer.on('signal', function(signal){
        request({
            body: JSON.stringify(signal),
            method: 'POST',
            url: opts.url + ':' + (opts.port || 80) + '/webrtc-connect',
            headers: {
                "Content-Type": "application/json"
            }
        }, function (err, resp, body) {
            if (err) {
                return callback(err, null);
            }
            peer.signal(body);
        })

    });

    peer.on('connect', function() {
        callback(null, peer);
    });
};
