var sprintf = require('sprintf-js').sprintf;

function print(){
  var result = sprintf.apply(null, arguments);
  process.stdout.write(result);
}

function println(){
  print.apply(null, arguments);
  process.stdout.write('\n');
}

module.exports = print;
print.ln = println;