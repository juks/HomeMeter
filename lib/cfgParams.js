exports.read = function(name, value, isCommandLine) {
  if (!isCommandLine) isCommandLine = false;

  if (!validParams.hasOwnProperty(name)) {
    return null;
  } else {
    if (validParams[name]['type'] == 's') {
      return value;
    } else if (validParams[name]['type'] == 'n') {
      return parseInt(value);
    } else if (validParams[name]['type'] == 'j') {
      return isCommandLine ? JSON.parse(value) : value;
    } else {
      return value == true ? true : false;
    }
  }
}