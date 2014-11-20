var should = require('should')
  , sinon = require('sinon')
  , rewire = require('rewire')
  , createRequestBuild = rewire('../../lib/request-build')
  , EventEmitter = require('events').EventEmitter

function Emitter() {
  EventEmitter.call(this)
}
Emitter.prototype = Object.create(EventEmitter.prototype)

describe('request-build', function () {

  it('should request source and untar to destination', function (done) {

    function request(url) {
      url.should.equal('http://url/to/request')
      var emitter = new Emitter()
      emitter.pipe = function (stream) {
        stream.type.should.equal('gpg.stdin')
        return stream
      }
      return emitter
    }

    var emitSpy = sinon.spy()
      , context = { emit: emitSpy }
      , extractCalled = false
      , untar =
        { Extract: function (opts) {
            extractCalled = true
            opts.path.should.equal('/tmp/navy-request-build-test2')
            var emitter = new Emitter()
            emitter.type = 'untar'
            return emitter
          }
        }
      , data =
        { source: 'http://url/to/request'
        , destination: '/tmp/navy-request-build-test2'
        , passphrase: 'abc123'
        }
      , mockSpawnCalled = false

    function mockSpawn(cmd, options) {
      mockSpawnCalled = true
      cmd.should.equal('gpg')
      options.length.should.equal(2)
      options[0].should.equal('--passphrase')
      options[1].should.equal('abc123')
      var spawn =
      { stdin:
        { type: 'gpg.stdin'
        , pipe: function (stream) {
            stream.type.should.equal('gpg.stdout')
            return stream
          }
        }
      , stdout:
        { type: 'gpg.stdout'
        , pipe: function (stream) {
            stream.type.should.equal('untar')
            stream.emit('end')
          }
        }
      }
      return spawn
    }

    createRequestBuild.__set__('spawn', mockSpawn)

    var requestBuild = createRequestBuild(request, untar)

    requestBuild(context, data, function (error) {
      should.not.exist(error)
      emitSpy.calledOnce.should.equal(true, 'emit not called once. Called:' + emitSpy.callCount)
      extractCalled.should.equal(true)
      mockSpawnCalled.should.equal(true)
      done()
    })
  })

  it('should report any errors from request', function (done) {

    function request() {
      var emitter = new Emitter()
      emitter.pipe = function (stream) {
        emitter.emit('error', { error: 'error with request' })
        return stream
      }
      return emitter
    }

    var context = { emit: function () {} }
      , untar =
        { Extract: function () {
            var emitter = new Emitter()
            return emitter
          }
        }
      , data = {}

    function mockSpawn() {
      var spawn =
      { stdin:
        { pipe: function (stream) {
            return stream
          }
        }
      , stdout: { pipe: function () {} }
      }
      return spawn
    }

    createRequestBuild.__set__('spawn', mockSpawn)

    var requestBuild = createRequestBuild(request, untar)

    requestBuild(context, data, function (error) {
      error.error.should.equal('error with request')
      done()
    })
  })

  it('should report any errors from untar', function (done) {

    function request() {
      var emitter = new Emitter()
      emitter.pipe = function (stream) {
        return stream
      }
      return emitter
    }

    var context = { emit: function () {} }
      , untar =
        { Extract: function () {
            var emitter = new Emitter()
            return emitter
          }
        }
      , data = {}

    function mockSpawn() {
      var spawn =
      { stdin:
        { pipe: function (stream) {
            return stream
          }
        }
      , stdout:
        { pipe: function (stream) {
            stream.emit('error', { error: 'error with untar' })
          }
        }
      }
      return spawn
    }

    createRequestBuild.__set__('spawn', mockSpawn)

    var requestBuild = createRequestBuild(request, untar)

    requestBuild(context, data, function (error) {
      error.error.should.equal('error with untar')
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
        , destination: '/tmp/navy-request-build-test2'
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
