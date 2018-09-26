var exec = require('child_process').exec
  , mkdirp = require('mkdirp')

module.exports = function createRequestBuild() {

  function requestBuild(context, data, callback) {
    if (context.isMaster) {
      context.emit('Master captain. Skipping build request')
      return callback(null, data)
    }

    context.emit('Untarring ' + data.source + ' to ' + data.destination)

    mkdirp(data.destination, function (error) {
      if (error) {
        return callback(error, data)
      }

      var cmd = 'curl ' + data.source + ' |'
        + ' gpg --decrypt --passphrase ' + data.passphrase + ' |'
        + ' tar xI unzstd -C ' + data.destination

      exec(cmd, function (error) {
        if (error) {
          return callback(error, data)
        }
        callback(null, data)
      })

    })

  }

  return requestBuild
}
