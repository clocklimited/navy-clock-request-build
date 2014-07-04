module.exports = function createRequestBuild(request, untar) {

  function requestBuild(context, data, callback) {
    var tarStream = request(data.source)

    tarStream.on('error', function (error) {
      callback(error, data)
    })

    tarStream.on('end', function () {
      callback(null, data)
    })

    context.emit('Untarring ' + data.source + ' to ' + data.destination)

    untar(data.destination, tarStream)
  }

  return requestBuild
}
