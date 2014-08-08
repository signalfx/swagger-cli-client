var print = require('./print'),
  path = require('path'),
  columnLayout = require('./columnLayout');

module.exports = function printOperations(api, resourceName){
  var resourceApi = api[resourceName];

  var appName = path.basename(process.argv[1]);
  print.ln('usage: %s %s [-v] [--auth <auth-token>] <operation> [<args>]', appName, resourceName);
  print.ln()

  var columns = columnLayout(3, 50);
  columns.colored('bold', 'Operation', 'Description');

  Object.keys(resourceApi).forEach(function(operationName){
    var operationHandler = resourceApi[operationName];
    if(!(operationHandler.auth || operationHandler.authorization)) return;
    
    columns(operationName, operationHandler.operation.summary);
  });

  print.ln(columns.toString());
};