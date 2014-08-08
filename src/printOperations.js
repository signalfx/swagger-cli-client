var print = require('./print'),
  path = require('path'),
  colors = require('colors'),
  columnLayout = require('./columnLayout');

module.exports = function printOperations(api, resourceName, error){
  var resourceApi = api[resourceName];

  var appName = path.basename(process.argv[1]);
  print.ln('usage: %s %s [-v] [--auth <auth-token>] <operation> [<args>]', appName, resourceName);
  print.ln()

  if(error){
    print.ln(colors.red(error.toString()));
    print.ln();
  }

  var columns = columnLayout({ 
    padding: 3, 
    maxColumnWidths: [20, 60]
  });
  columns.colored('bold', 'Operation', 'Description');

  Object.keys(resourceApi).forEach(function(operationName){
    var operationHandler = resourceApi[operationName];
    if(!(operationHandler.auth || operationHandler.authorization)) return;
    
    columns(operationName, operationHandler.operation.summary);
  });

  print.ln(columns.toString());
};