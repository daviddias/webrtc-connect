var readline = require('readline')
var rtcc = require('./../src')

rtcc.createServer(function (err, channel) {
  if (err) {
    return console.log('oh noes!')
  }
  console.log('channel-open')
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.on('line', function (ln) {
    channel.send(ln)
  })

  channel.on('data', function (data) {
    console.log(data)
  })

}).listen('9999')
