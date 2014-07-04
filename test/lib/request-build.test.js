var should = require('should')
  , sinon = require('sinon')
  , createRequestBuild = require('../../lib/request-build')
  , EventEmitter = require('events').EventEmitter

function Emitter() {
  EventEmitter.call(this)
}
Emitter.prototype = Object.create(EventEmitter.prototype)

describe('request-build', function () {

  it('should request source and untar to destination', function (done) {

    function request(url) {
      url.should.equal('http://url/to/request')
      return new Emitter()
    }

    function untar(destination, stream) {
      destination.should.equal('/tmp/navy-rsync-test2')
      should.exist(stream)
      stream.emit('end')
    }

    var emitSpy = sinon.spy()
      , context = { emit: emitSpy }
      , data =
        { source: 'http://url/to/request'
        , destination: '/tmp/navy-rsync-test2'
        }
      , requestBuild = createRequestBuild(request, untar)

    requestBuild(context, data, function (error) {
      should.not.exist(error)
      emitSpy.calledOnce.should.equal(true, 'emit not called once. Called:' + emitSpy.callCount)
      done()
    })
  })

  it('should request report any errors', function (done) {

    function request(url) {
      url.should.equal('http://url/to/request')
      return new Emitter()
    }

    function untar(destination, stream) {
      destination.should.equal('/tmp/navy-rsync-test2')
      should.exist(stream)
      stream.emit('error', {})
    }

    var emitSpy = sinon.spy()
      , context = { emit: emitSpy }
      , data =
        { source: 'http://url/to/request'
        , destination: '/tmp/navy-rsync-test2'
        }
      , requestBuild = createRequestBuild(request, untar)

    requestBuild(context, data, function (error) {
      should.exist(error)
      emitSpy.calledOnce.should.equal(true, 'emit not called once. Called:' + emitSpy.callCount)
      done()
    })
  })

})
