exports.help = function(validParams) {
  console.log("\nHomeMeter is a Node.js application for Raspberry PI that collect home meters values");
  console.log("\nAvailable parameters:\n");
  for (var name in GLOBAL.validParams) {
    var left = '--' + name;
    if (GLOBAL.validParams[name]['sample']) left += '=' + GLOBAL.validParams[name]['sample'];
    left += ':';

    console.log(left + ' '.repeat(50 - left.length) + GLOBAL.validParams[name]['title']);
  }
}