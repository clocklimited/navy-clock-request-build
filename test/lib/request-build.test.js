var assert = require('assert')
  , sinon = require('sinon')
  , rewire = require('rewire')
  , createRequestBuild = rewire('../../lib/request-build')

describe('request-build', function () {

  function runTest(options, done) {
    var emitSpy = sinon.spy()
      , context = { emit: emitSpy }
      , data =
        { source: 'http://url/to/request'
        , destination: '/tmp/navy-request-build-test2'
        , passphrase: 'abc123'
        }
      , mockMkdirpCalled = false
      , mockExecCalled = false

    function mockMkdirp(dir, callback) {
      mockMkdirpCalled = true
      assert.equal(dir, data.destination)
      if (options.mkdirpError) {
        return callback(new Error())
      }
      callback()
    }

    function mockExec(cmd, callback) {
      mockExecCalled = true
      var expectedCmd = 'curl http://url/to/request |'
        + ' gpg --decrypt --passphrase abc123 |'
        + ' tar xI unzstd -C /tmp/navy-request-build-test2'
      cmd.should.equal(expectedCmd)
      if (options.execError) {
        return callback(new Error())
      }
      callback()
    }

    createRequestBuild.__set__('mkdirp', mockMkdirp)
    createRequestBuild.__set__('exec', mockExec)

    var requestBuild = createRequestBuild()

    requestBuild(context, data, function (error) {
      if (options.mkdirpError || options.execError) {
        assert(error, 'error should exist')
      } else {
        assert.equal(error, null)
      }
      assert.equal(mockMkdirpCalled, true, 'mkdirp was not called')
      if (options.mkdirpError) {
        assert.equal(mockExecCalled, false, 'exec was called')
      } else {
        assert.equal(mockExecCalled, true, 'exec was not called')
      }
      assert.equal(emitSpy.calledOnce, true, 'emit not called once. Called:' + emitSpy.callCount)
      done()
    })
  }

  it('should request source and untar to destination with no errors', function (done) {
    runTest({ mkdirpError: false, execError: false }, done)
  })

  it('should request source and untar to destination with mkdirp errors', function (done) {
    runTest({ mkdirpError: true, execError: false }, done)
  })

  it('should request source and untar to destination with exec errors', function (done) {
    runTest({ mkdirpError: false, execError: true }, done)
  })

  it('should not do anything if captain is master', function (done) {

    var emitSpy = sinon.spy()
      , context = { emit: emitSpy, isMaster: true }
      , data =
        { source: 'http://url/to/request'
        , destination: '/tmp/navy-request-build-test2'
        }
      , requestBuild = createRequestBuild()

    requestBuild(context, data, function (error) {
      assert.equal(error, null)
      assert.equal(emitSpy.calledOnce, true, 'emit not called once. Called:' + emitSpy.callCount)
      done()
    })
  })

})
