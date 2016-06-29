var gpio    = require('rpi-gpio');
var fs      = require('fs');
var winston = require('winston');
var helpers = require('./lib/helpers');
var argv    = require('minimist')(process.argv.slice(2));

var wiring = require('./wiring.js');

// Available runtime parameters configuration
GLOBAL.validParams = require('./parameters.js').params;

// This one displays configuration help
String.prototype.repeat = function(num)  {
  return new Array( num + 1 ).join( this );
}

var c = {};
var defaults = {};
var logger = null;
var fileTransport = null;

var cfgParam = require('./lib/cfgParams.js');

// Loading command line parameters
for (var name in argv) {
  if (name == '_' || name.substring(0,1) == '$') continue;

  var val = cfgParam.read(name, argv[name], true);

  if (val !== null) {
    c[name] = val;
  } else {
    console.log("Configuration error: invalid parameter " + name + ". See node homeMeter.js --help to see available parameters\n");
    process.exit(0);
  }
}

// Read file config
if (c.c) {
  if (!fs.existsSync(c.c)) {
    console.log("Configuration file " + c.c + " does not exist!");
    process.exit(0);
  }

  var cfgData = JSON.parse(fs.readFileSync(c.c, 'utf8'));

  for (var name in cfgData) {
    var val = cfgParam.read(name, cfgData[name]);

    if (val !== null) {
      c[name] = val;
    } else {
      console.log("Configuration file: invalid parameter " + name + ". See node homeMeter.js --help to see available parameters\n");
      process.exit(0);
    }
  }
}

//
// Logging
//
if (c.v) c.debugLevel = 'info';
if (c.vv) c.debugLevel = 'verbose';

var transports = [];
var dateFunc = function() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).substr(-2) + '-' + ('0' + d.getDate()).substr(-2) + ' ' + ('0' + d.getHours()).substr(-2) + ':' + ('0' + d.getMinutes()).substr(-2) + ':' + ('0' + d.getSeconds()).substr(-2)}

// Set up console logging
if (!c.silent) {
  transports.push(new (winston.transports.Console)(
    {
      timestamp:  dateFunc,
      level:      c.debugLevel
    }));
}

winston.level = c.debugLevel;
winston.showLevel = false;

if (c.logFile) {
  fileTransport = new (winston.transports.File) (
    {
      filename:       c.logFile,
      json:           false,
      showLevel:      false,
      colorize:       false,
      timestamp:      dateFunc,
      level:          c.debugLevel
    });

  transports.push(fileTransport);
}

logger = new (winston.Logger) ({
  transports: transports
});

logger.exitOnError = false;

// Logger func
function dd(msg, level)  {
  if (!logger) return;
  if (!msg) return;
  if (!level) level = 'info';

  logger.log(level, msg);
}

global.dd = dd;

//
// Applying defaults
//
for (var name in GLOBAL.validParams) {
  if (validParams[name]['default'] && !c.hasOwnProperty(name)) {
    c[name] = validParams[name]['default'];
    defaults[name] = true;
  }
}

//
// Display help screen
//
if (c.help) {
  require('./lib/showHelp.js').help(GLOBAL.validParams);
  process.exit(0);
}

var publishedModules = {};

//
// Main
//
for (var pin in wiring.pins) {
  var module = new (require('./lib/meters/' + wiring.pins[pin].type))(wiring.pins[pin]);

  gpio.setup(pin, wiring.pins[pin].pinMode, wiring.pins[pin].edgeMode);

  wiring.pins[pin].module = module;
  if (wiring.pins[pin].submitter) {
    var idx = 'sub' + wiring.pins[pin].submitter.charAt(0).toUpperCase() + wiring.pins[pin].submitter.slice(1);
    var submitterConfig = c[idx];
    module.submitter = new (require('./lib/submitters/' + wiring.pins[pin].submitter))(module, submitterConfig);
  }

  publishedModules[wiring.pins[pin].alias] = module;

  dd('Published module "' + wiring.pins[pin].type + '" as "' + wiring.pins[pin].alias + '"');
}

// Read dumped data
if (c.dumpFile && fs.existsSync(c.dumpFile) && Object.keys(publishedModules).length) {
  dd('Restoring values from ' + c.dumpFile);

  dumpData = JSON.parse(fs.readFileSync(c.dumpFile));
  for (var alias in dumpData) {
    if (alias in publishedModules) publishedModules[alias].restore(dumpData[alias]);
  }
}

// Gpio pins handler
gpio.on('change', function(pin, value) {
  dd('GPIO event on pin ' + pin + ' with value "' + value + '"', 'verbose');

  if (pin in wiring.pins) {
    if (!('triggerValue' in wiring.pins[pin]) || wiring.pins[pin].triggerValue == value) {
      var dataChanged = wiring.pins[pin].module.trigger();
      dd('Triggered "' + wiring.pins[pin].module.alias + '" meter');

      if (dataChanged) dump();
    }
  }
})

// Start local web server
if (c.localServerPort) {
  var server = new (require('./lib/webserver'))({
    port: c.localServerPort,
    data: {publishedModules: publishedModules}
  });

  dd('Started web server on port ' + c.localServerPort);
}

//
// Signals
//
process.on('SIGINT', function() {
  dd('Got SIGINT!');
  process.exit(0);
});

process.on('SIGTERM', function() {
  dd('Got SIGTERM!');
  process.exit(0);
});

process.on('SIGHUP', function() {
  dd('Got SIGHUP');
  if (fileTransport) {
    dd('Rotating logs');
    helpers.winstonRotate(fileTransport);
  }
});

// Exit: what should I do?
process.on('exit', function(code) {
  // Dump my stuff
  dump();

  dd('Bye!');
});

function dump() {
  if (c.dumpFile) {
    dd('Dumping everything to ' + c.dumpFile);

    var dumpData = {};

    for (var alias in publishedModules) {
      dumpData[alias] = publishedModules[alias].dump();
    }

    fs.writeFileSync(c.dumpFile, JSON.stringify(dumpData));
  }
}