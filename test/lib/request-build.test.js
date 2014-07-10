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

  it('should report any errors', function (done) {

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

  it('should not do anything if captain is master', function (done) {

    var emitSpy = sinon.spy()
      , request = sinon.spy()
      , untar = sinon.spy()
      , context = { emit: emitSpy, isMaster: true }
      , data =
        { source: 'http://url/to/request'
        , destination: '/tmp/navy-rsync-test2'
        }
      , requestBuild = createRequestBuild(request, untar)

    requestBuild(context, data, function (error) {
      should.not.exist(error)
      request.callCount.should.equal(0, 'request should not be called at all. Called:' + request.callCount)
      untar.callCount.should.equal(0, 'untar should not be called at all. Called:' + untar.callCount)
      emitSpy.calledOnce.should.equal(true, 'emit not called once. Called:' + emitSpy.callCount)
      done()
    })
  })

})
