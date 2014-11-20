var spawn = require('child_process').spawn

module.exports = function createRequestBuild(request, tar) {

  function requestBuild(context, data, callback) {
    if (context.isMaster) {
      context.emit('Master captain. Skipping build request')
      return callback(null, data)
    }

    var tarStream = request(data.source)
      , untar = tar.Extract({ path: data.destination })
      , gpg = spawn('gpg', [ '--passphrase', data.passphrase ])

    tarStream.on('error', function (error) {
      callback(error, data)
    })

    untar.on('error', function (error) {
      callback(error, data)
    })

    untar.on('end', function () {
      callback(null, data)
    })

    context.emit('Untarring ' + data.source + ' to ' + data.destination)

    tarStream.pipe(gpg.stdin).pipe(gpg.stdout).pipe(untar)
  }

  return requestBuild
}
