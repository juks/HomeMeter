var helpers = require('../../../helpers');

var optionsToImport = ['type', 'kind', 'alias', 'title', 'unitTitle', 'weight', 'delimiter'];

function water(options) {
  this.measureLog     = Array();
  this.weight         = 1;
  this.delimiter      = 1000;
  this.baseValue      = 0;
  this.type           = '';
  this.kind           = '';
  this.alias          = '';
  this.title          = '';
  this.maxLogItems    = 100;

  optionsToImport.forEach(function(name) {
    if (name in options) this[name] = options[name];
  }.bind(this));
}

// Trigger the counter
water.prototype.trigger = function() {
  var date = new Date();

  this.measureLog.push({
                      count:     1,
                      timestamp: Date.now(),
                      datetime:  helpers.getDate()
                  });

  // Shrink log
  if (this.measureLog.length > this.maxLogItems) {
    this.measureLog = this.measureLog.splice(0, this.maxLogItems);
  }

  this.baseValue += this.weight;

  return true;
}

// Get current measure
water.prototype.getMeasure = function() {
  return this.baseValue / this.delimiter;
}

// Resets the stats
water.prototype.clearLog = function() {
  this.measureLog = [];
}

// Sets new base value
water.prototype.setValue = function(value) {
  this.baseValue = parseFloat(value) * this.delimiter;
  this.clearLog();
}

// Dumps state
water.prototype.dump = function() {
  return {baseValue: this.baseValue, measureLog: this.measureLog};
}

// Restores state
water.prototype.restore = function(data) {
  if ('baseValue' in data) this.baseValue = data.baseValue;
  if ('measureLog' in data) this.measureLog = data.measureLog;
}

module.exports = water;