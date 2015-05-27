var rtcc = require('./../src')

rtcc.createServer(function (channel) {
  console.log('got new channel')
}).listen('9999')
