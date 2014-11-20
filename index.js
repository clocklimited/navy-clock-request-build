var request = require('request')
  , untar = require('untar')
  , requestBuild = require('./lib/request-build')(request, untar)

module.exports = function rsync() {

  var steps =
  { init: init
  , requestBuild: requestBuild
  }

  function getSteps() {
    return steps
  }

  function getStepList() {
    return Object.keys(steps)
  }

  function init(context, callback) {
    var data =
      { source: context.orderArgs[0]
      , destination: context.orderArgs[1]
      , passphrase: context.orderArgs[2]
      }

    callback(null, data)
  }

  return {
    getSteps: getSteps
  , getStepList: getStepList
  }

}
