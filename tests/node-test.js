var Lab = require('lab')
var Code = require('code')
var lab = exports.lab = Lab.script()

var experiment = lab.experiment
var test = lab.test
var before = lab.before
var after = lab.after
var expect = Code.expect

var rtcc = require('../src/index.js')

experiment('node.js tests ', function () {
  before(function (done) {
    done()
  })

  after(function (done) {
    done()
  })

  test('connect a client to a fresh server', function (done) {
    rtcc.createServer(function (channel) {}).listen('9999')

    rtcc.connect({url: 'http://localhost', port: 9999}, function (err, channel) {
      console.log(err)
      expect(err).to.be.null()
      done()
    })
  })

  test('connect a client to an attached server')
})
