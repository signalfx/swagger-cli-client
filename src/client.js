var clientGenerator = require('swagger-node-client'),
  minimist = require('minimist'),
  columnLayout = require('./columnLayout');
  path = require('path'),
  colors = require('colors'),
  sprintf = require('sprintf-js').sprintf;

module.exports = function(schema){
  var api = clientGenerator(schema);

 // console.log(schema);

  var args = minimist(process.argv.slice(2));

  var resourceName = args._[0];
  var operationName = args._[1];
  var operationHasArgs = args._.length > 2;
  
  if(resourceName){
    if(operationName){
      var operation = api[resourceName][operationName];

      if(operationHasArgs){
        operation(args._[2]).then(function(response){
          console.log(response);
        }).catch(function(response){
          console.error(response);
        });
      } else {
        printOperation(operation);
      }
    } else {
      printOperations(api, resourceName);
    }
  } else {
    printUsage();
  }

  function printUsage(){
    var myName = path.basename(process.argv[1]);
    println('usage: %s [--version] [--auth <auth-token>] <resource> [<args>]', myName);
    println()
    if(schema.info && schema.info.title){
      print(schema.info.title.bold);
      if(schema.apiVersion) print(' v' + schema.apiVersion.bold);
      println();

      println(columnLayout.wrap(schema.info.description, 80));
    }
    
    // print resources
    println();

    var columns = columnLayout(3, 50);
    columns('Resource', 'Description');

    Object.keys(api).forEach(function(resourceName){
      var resource = api[resourceName];
      if(!(resource.auth || resource.authorization)) return;

      var description = getResourceDescription(resourceName, api[resourceName]);
      columns(resourceName, description);
    });

    println(columns.toString());
  }

  function printOperations(api, resourceName){
    var resourceApi = api[resourceName];

    var myName = path.basename(process.argv[1]);
    println('usage: %s %s [--version] [--auth <auth-token>] <operation> [<args>]', myName, resourceName);
    println()

    var columns = columnLayout(3, 50);
    columns('Operation', 'Description');

    Object.keys(resourceApi).forEach(function(operationName){
      var operationHandler = resourceApi[operationName];
      if(!(operationHandler.auth || operationHandler.authorization)) return;
      
      columns(operationName, operationHandler.operation.summary);
    });

    println(columns.toString());
  }

  function printOperation(operationHandler){
    var operation = operationHandler.operation;

    var myName = path.basename(process.argv[1]);
    println('usage: %s %s [--auth <auth-token>] <operation> [<args>]', myName, operation.nickname);
    println()
  }
};

function wrap(string, width){
  var index = 0,
    chunks = [],
    chunk;

  string = string.replace(/\n/g, '');

  for(index; index < string.length; index += width){
    chunks.push(string.substr(index, width));
  }

  return chunks.join('\n');
}

function getResourceDescription(resourceName, resourceApi){
  var apiObject;
  
  Object.keys(resourceApi).some(function(operationHandlerName){
    var operationHandler = resourceApi[operationHandlerName];

    if(operationHandler.auth){
      apiObject = operationHandler.operation.apiObject;
      return true;
    } 
  });

  // Since api declaration resource paths are chosen preferentially for naming
  // of the api (instead of apiObject paths), we'll use the description for it
  // if it has a resource path
  if(apiObject.apiDeclaration.resourcePath){
    return apiObject.resourceObject.description;
  } else {
    return apiObject.description;
  }
}

function println(){
  print.apply(null, arguments);
  process.stdout.write('\n');
}

function print(){
  var result = sprintf.apply(null, arguments);
  process.stdout.write(result);
}
/*
usage: petstore [--version] [--auth] <command>

<title> <version>
<description>
<tos>
*/