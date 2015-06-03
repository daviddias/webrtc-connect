var readline = require('readline')
var rtcc = require('./../src')

rtcc.connect({url: 'http://localhost', port: 9999}, function (err, channel) {
  if (err) {
    return console.log('err', err)
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

})
