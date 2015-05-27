var rtcc = require('./../src');


rtcc.connect({url: 'http://localhost', port: 9999}, function(err, channel) {
    if (err)
        return console.log('err', err);
    console.log('wooo')
    channel.send('hey');
});
