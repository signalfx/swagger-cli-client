function columnLayout(paddingWidth, maxColumnWidths){
  paddingWidth = paddingWidth || 0;
  maxColumnWidths = maxColumnWidths || Infinity;

  var padding = sprintf('%' + paddingWidth + 's', '');
  var rows = [];
  var columns = [];

  function getMaxColumnWidth(columnIndex){
    if(Array.isArray(maxColumnWidths)) return maxColumnWidths[columnIndex];
    return maxColumnWidths;
  }

  function addColumn(){
    var row = [].slice.call(arguments);
    
    // Add borders
    
    row.forEach(function(element, index){
      var column = columns[index];
      if(!column) column = columns[index] = [];
      column.push(element);
    });

    rows.push(row);

    return function(mapper){
      row.forEach(function(string, index){
        row[index] = mapper(string);
      });
    }
  }

  addColumn.toString = function(){
    var columnWidths = columns.map(function(column){
      return maxStringLength(column);
    });

    function offset(columnIndex, maxColumnWidth){
      var offset = paddingWidth,
        maxColumnWidth;

      while(columnIndex--) {
        maxColumnWidth = getMaxColumnWidth(columnIndex);
        offset += Math.min(columnWidths[columnIndex], maxColumnWidth) + padding.length;
      }

      return offset;
    }

    return rows.map(function(row){
      return padding + row.map(function(element, index){
        var string = element.toString(),
          width = columnWidths[index],
          maxColumnWidth = getMaxColumnWidth(index);
        
        if(width > maxColumnWidth){
          var wrapPadding = sprintf('%' + offset(index) + 's', '');
          return wrap(string, maxColumnWidth).split('\n').join('\n' + wrapPadding);
        } else {
          return sprintf('%-' + width + 's', string);
        }
      }).join(padding);
    }).join('\n');
  };

  return addColumn;
};

module.exports = columnLayout;

function maxStringLength(strArr){
  return strArr.reduce(function(a, b){ 
    return a.toString().length > b.toString().length ? a.toString() : b.toString();
  }, '').length;
}

function wrap(string, width){
  var index = 0,
    substr,
    chunks = [],
    chunk;

  string = string.replace(/\n/g, '');

  for(index; index < string.length; index += width){
    substr = string.substr(index, width).trim();
    chunks.push(sprintf('%-' + width + 's', substr));
  }

  return chunks.join('\n');
}
columnLayout.wrap = wrap;