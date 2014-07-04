var should = require('should')
  , assert = require('assert')
  , clockRequestBuild = require('../index')()

describe('clock-request-build', function () {

  it('should return steps', function () {
    var steps = clockRequestBuild.getSteps()
    assert.equal(typeof steps.init, 'function')
    assert.equal(typeof steps.requestBuild, 'function')
  })

  it('should return steps list', function () {
    var stepList = clockRequestBuild.getStepList()
    stepList.length.should.equal(2)
    stepList[0].should.equal('init')
    stepList[1].should.equal('requestBuild')
  })

  it('should run the init function', function (done) {
    var steps = clockRequestBuild.getSteps()
      , context =
        { orderArgs: [ 'source', 'destination' ]
        }

    steps.init(context, function (error, data) {
      should.not.exist(error)
      Object.keys(data).length.should.equal(2)
      data.source.should.equal(context.orderArgs[0])
      data.destination.should.equal(context.orderArgs[1])
      done()
    })
  })

})
