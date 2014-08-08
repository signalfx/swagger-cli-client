var columnLayout = require('./columnLayout'),
  print = require('./print');

function printResources(api){
  var columns = columnLayout({ 
    padding: 3, 
    maxColumnWidths: [20, 40]
  });

  columns.colored('bold', 'Resource', 'Description');
  
  Object.keys(api).forEach(function(resourceName){
    var resource = api[resourceName];
    if(!(resource.auth || resource.authorization)) return;

    var description = getResourceDescription(api[resourceName]);
    columns(resourceName, description);
  });

  print.ln(columns.toString());
}

module.exports = printResources;


function getResourceDescription(resourceApi){
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
