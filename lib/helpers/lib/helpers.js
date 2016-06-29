var path = require('path');
var fs   = require('fs');

// Random string generator
module.exports.randomString = function(length, mode) {
  var charsNumbers = '0123456789';
  var charsLower   = 'abcdefghijklmnopqrstuvwxyz';
  var charsUpper   = charsLower.toUpperCase();

  var chars = '';
  if (!mode || mode == 1) chars += charsNumbers;
  if (!mode || mode == 2) chars += charsLower + charsUpper;
  if (!length) length = 32;

  var string = '';

  for (var i = 0; i < length; i++) {
    var randomNumber = Math.floor(Math.random() * chars.length);
    string += chars.substring(randomNumber, randomNumber + 1);
  }

  return string;
}

module.exports.randomCase = function(v) {
  return Math.floor(Math.random() * (v - 0)) == 1;
}

module.exports.getDate = function() {
  var d = new Date();

  return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).substr(-2) + '-' + ('0' + d.getDate()).substr(-2) + ' ' + ('0' + d.getHours()).substr(-2) + ':' + ('0' + d.getMinutes()).substr(-2) + ':' + ('0' + d.getSeconds()).substr(-2);
}

module.exports.winstonRotate = function(fileTransport) {
  var fullname = path.join(fileTransport.dirname, fileTransport._getFile(false));

  function reopen() {
    if (fileTransport._stream) {
      fileTransport._stream.end();
      fileTransport._stream.destroySoon();
    }

    var stream = fs.createWriteStream(fullname, fileTransport.options);
    stream.setMaxListeners(Infinity);

    fileTransport._size = 0;
    fileTransport._stream = stream;

    fileTransport.once('flush', function () {
      fileTransport.opening = false;
      fileTransport.emit('open', fullname);
    });

    fileTransport.flush();
  }

  return reopen();
}