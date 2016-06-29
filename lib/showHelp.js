exports.help = function(validParams) {
  console.log("\nHomeMeter is a Node.js application for Raspberry PI that collect home meters values");
  console.log("\nAvailable parameters:\n");
  for (var name in GLOBAL.validParams) {
    var left = '--' + name;
    if (GLOBAL.validParams[name]['sample']) left += '=' + GLOBAL.validParams[name]['sample'];
    left += ':';
    var ln = 75 - left.length;
    if (ln < 1) ln = 1;
    console.log(left + ' '.repeat(ln) + GLOBAL.validParams[name]['title']);
  }
}