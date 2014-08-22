var stripAnsi = require('strip-ansi'),
  sprintf = require('sprintf-js').sprintf,
  colors = require('colors');

function strlen(str){
  if(!str) return 0;
  return stripAnsi(str.toString()).length;
}

function columnLayout(paddingWidth, columnWidthOption){
  var api,
    options,
    paddingWidth,
    columnWidths,
    maxColumnWidths,
    columnMappers,
    rowMappers,
    maxColumnWidth;

  if(Array.isArray(columnWidthOption)){
    maxColumnWidths = columnWidthOption;
  } else if(typeof columnWidthOption === 'number'){
    maxColumnWidth = columnWidthOption;
  }

  if(typeof paddingWidth === 'object') {
    options = paddingWidth;
    paddingWidth = options.padding;
    columnWidths = options.columnWidths;
    maxColumnWidths = options.maxColumnWidths;
    maxColumnWidth = options.maxColumnWidth;
    columnMappers = options.columnMappers;
    rowMappers = options.rowMappers;
  }

  columnMappers = columnMappers || [];
  rowMappers = rowMappers || [];
  paddingWidth = paddingWidth || 0;
  columnWidths = columnWidths || [];
  maxColumnWidths = maxColumnWidths || [];
  maxColumnWidth = maxColumnWidth || Infinity;

  var padding = sprintf('%' + paddingWidth + 's', '');
  var rows = [];
  var columns = [];

  function getColumnWidth(index){
    var maxColumnWidth = maxColumnWidths[index] || maxColumnWidth || Infinity;
    var columnWidth = columnWidths[index] || 'auto';
    
    if(columnWidth === 'auto'){
      return Math.min(maxStringLength(columns[index]), maxColumnWidth);
    } else {
      return columnWidth;
    }
  }

  function addRow(){
    var row = [].slice.call(arguments);
    
    row.forEach(function(element, index){
      var column = columns[index];
      if(!column) column = columns[index] = [];

      if(Array.isArray(element)){
        column.push(element[0]);
      } else {
        column.push(element);
      }
    });

    rows.push(row);
  }
  api = addRow;
  api.row = addRow;

  function addColoredRow(){
    var row = [].slice.call(arguments),
      colorString = row.shift(0);
    
    function colorMapper(string){
      colorString.split('.').forEach(function(colorName){
        string = colors[colorName](string);
      });

      return string;
    }

    rowMappers[rows.length] = colorMapper;

    addRow.apply(null, row);
  }
  api.colored = addColoredRow;

  api.toString = function(){
    function offset(columnIndex){
      var offset = 0,
        index = 0,
        columnWidth;

      for(; index <= columnIndex; index++){
        offset += getColumnWidth(columnIndex);
      }

      return offset;
    }

    return rows.map(function(row, rowIndex){
      var rowMapper = rowMappers[rowIndex] || identity;
      var elementMappers = [];

      var renderedRow = row.map(function(element, columnIndex){
        // Unpack elements with mappers ['text', mapper]
        if(Array.isArray(element)){
          elementMappers[columnIndex] = element[1];
          element = element[0];
        } else if(element === undefined){
          element = '';
        }

        var string = element.toString(),
          columnWidth = getColumnWidth(columnIndex);
     
        if(strlen(string) > columnWidth){
          return wrap(string, columnWidth).split('\n');
        } else {
          return [sprintf('%-' + columnWidth + 's', string)];
        }
      });

      var subrowCount = renderedRow.map(function(subrows){ 
        return subrows.length;
      }).reduce(function(a, b){
          return Math.max(a, b);
      }, 0);
      
      var index = 0;
      var subrows = [];
      
      for(; index < subrowCount; index++){
        subrows.push(padding + renderedRow.map(function(subrows, columnIndex){
          if(subrows[index] !== undefined){
            var columnMapper = columnMappers[columnIndex] || identity;
            var elementMapper = elementMappers[columnIndex] || identity;
            return columnMapper(elementMapper(subrows[index]));
          } else {
            return sprintf('%' + offset(columnIndex) + 's', '');
          }
        }).join(index? '': padding)); // only add padding to first row
      }
    
      return rowMapper(subrows.join('\n'));
    }).join('\n');
  };

  return addRow;
};

module.exports = columnLayout;

function maxStringLength(strArr){
  return strArr.map(function(item){ return strlen(item); })
    .reduce(function(a, b){ 
      return Math.max(a, b);
    }, 0);
}

function identity(item){ return item; };

function wrap(string, width){
  var index = 0,
    substr,
    chunks = [],
    chunk;

  string = string.replace(/\n/g, '');
  var length = strlen(string);
  for(index; index < length; index += width){
    substr = string.substr(index, width).trim();
    chunks.push(sprintf('%-' + width + 's', substr));
  }

  return chunks.join('\n');
}
columnLayout.wrap = wrap;