var print = require('./print'),
  yaml = require('js-yaml'),
  path = require('path'),
  colors = require('colors'),
  validate = require('swagger-validate'),
  columnLayout = require('./columnLayout');

function handleOperation(operationHandler, args, models){
  var operation = operationHandler.operation;
  var models = operation.apiObject.apiDeclaration.models;

  if(args.h){
    return printOperation(operationHandler);
  }
  
  Object.keys(args).forEach(function(arg){
    if(arg === '_') return;
    try {
      args[arg] = yaml.safeLoad(args[arg]);
    } catch(e){
      // It's ok to have an error here, this is just a helper
      // and is expected to fail sometimes
    }
  });

  var data = args._.shift();
  if(data !== undefined){
    try { data = yaml.safeLoad(data); } catch(e) {}
    data = singleParamConvenienceProcessor(operation, data);
  } else {
    data = args;
  }

  var errors;
  try {
    e = operationHandler.validate(data, operation, models);
  } catch (e) {
    errors = new Error('Invalid query');
  }

  if(errors || args.h){
    printOperation(operationHandler, errors);
  } else {
    operationHandler(data).then(function(response){
      print.ln(response);
    }).catch(function(response){
      printOperation(operationHandler, response.errors || response);
    });
  }
}
module.exports = handleOperation;

// Enables data to be passed directly for single param operations.
function singleParamConvenienceProcessor(operation, data){
  // If there are more than one params, bail
  var requiredParams = operation.parameters.filter(function(param){
    return param.required;
  });

  // If there are more than one required params, or if there is no required param
  // and there are many optional params, bail
  if(requiredParams.length > 1) return data;

  if(requiredParams.length !== 1 && operation.parameters.length !== 1) return data;

  var param = requiredParams[0] || operation.parameters[0];
  
  // If the param is already defined explicitly, bail
  if(typeof data === 'object' && (param.name in data)) return data;

  var models = operation.apiObject.apiDeclaration.models;

  // If the data passed is is not valid for the param data type, bail
  var error;
  if(typeof data === 'object'){
    try {
      error = validate.dataType(data, param, models); 
    } catch(e) {
      error = e;
    }
  }
  
  // If the data passed is a valid param data type, bail
  if(!error){
    var wrapper = {};
    wrapper[param.name] = data;
    return wrapper;
  } else {
    return data;
  }
}

function printOperation(operationHandler, error){
  var operation = operationHandler.operation;
  var resourceName = getResourceApiName(operation.apiObject);
  
  var appName = path.basename(process.argv[1]);
  print.ln('usage: %s %s %s [--auth <auth-token>] [--<parameter> <parameterValue]', appName, resourceName, operation.nickname);
  print.ln()

  if(error){
    print.ln(colors.red(error.toString()));
    print.ln();
  }

  var columns = columnLayout({
    padding: 3, 
    maxColumnWidths: [20, 20, 60]});
  columns.colored('bold', 'Parameter', 'Type', 'Description');

  operation.parameters.sort(function(a, b){
    if(a.required && b.required) return a.name.localeCompare(b.name);
    if(a.required) return -1;
    return 1;
  }).forEach(function(parameter){
    columns(
      parameter.name + (parameter.required?'*':''), 
      parameter.type || parameter.dataType,
      parameter.description
    );
    
    columns('', '', '');
  });

  print.ln(columns.toString());
  print.ln();
  print.ln('   *required parameter');
}

// Takes a path and returns a JavaScript-friendly variable name
function getResourceApiName(apiObject){
  var path = apiObject.apiDeclaration.resourcePath || apiObject.path;

  // String non-word characters
  path = path.replace(/\W/g, '/');

  // Turn paths which look/like/this to lookLikeThis
  path = path.replace(/(\w)\/(\w)/g, function(match, p1, p2){
    return p1 + p2.toUpperCase();
  });

  path = path.replace(/\//g, '');

  return path;
}
