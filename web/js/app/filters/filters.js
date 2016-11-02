/**
 * Number dollar filter
 */
app.filter('numberDollar', ['$filter', function($filter) {
  return function(number, fractionSize) {
    if (!isNaN(parseFloat(number)) && isFinite(number)) {
      return '$' +  $filter('numberNF')(number, fractionSize);
    } 
    return number;
  };
}]);

/**
 * Number no franction
 */
app.filter('numberNF', ['$filter', function($filter) {
  return function(number, fractionSize) {
    if (Math.floor(number) == number) {
      return $filter('number')(number, 0);
    }
    return $filter('number')(number, fractionSize);
  };
}]);

/**
 * Limit string length and add ellipsis at the end
 */
app.filter('limitToEllipsis', ['$filter', function($filter) {
  return function(input, limit, begin, maxRes) {
    if (!maxRes || window.matchMedia('(max-width: ' + maxRes + 'px)').matches) {
      var str = $filter('limitTo')(input, limit, begin);
      
      if (null != input && str.length < input.length) {
        str += '...';
      } 
    } else {
      var str = input;
    }
    
    return str;
  };
}]);

/**
 * Create range
 */
app.filter('range', function() {
  return function(input, start, end) {
    start = parseInt(start);
    end = parseInt(end);
    if (start > end) {
      for (var i = start; i >= end; i--) {
        input.push(i);
      }
    } else {
      for (var i = start; i <= end; i++) {
        input.push(i);
      }
    }
    return input;
  };
});

/**
 * Create range of string
 */
app.filter('range_s', function() {
  return function(input, start, end) {
    start = parseInt(start);
    end = parseInt(end);
    if (start > end) {
      for (var i = start; i >= end; i--) {
        input.push(i.toString());
      }
    } else {
      for (var i = start; i <= end; i++) {
        input.push(i.toString());
      }
    }
    return input;
  };
});

/**
 * return months list
 */
app.filter('monthName', [function() {
  return function (monthNumber) { //1 = January
      var monthNames = [ 'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December' ];
      return monthNames[monthNumber - 1];
  }
}]);

/**
 * Filter to check if object is empty
 */
app.filter('isEmpty', [function() {
  return function (obj) {
     return !Object.keys(obj).length;
  }
}]);

/**
 * set trustAsResourceUrl
 */
app.filter('trustAsResourceUrl', ['$sce', function($sce) {
  return function(val) {
    return $sce.trustAsResourceUrl(val);
  };
}]);

/**
 * format phone number
 */
app.filter('tel', function () {
  return function (tel) {
      if (!tel) { return ''; }

      var value = tel.toString().trim().replace(/^\+/, '');

      if (value.match(/[^0-9]/)) {
          return tel;
      }

      var country, city, number;

      switch (value.length) {
          case 10: // +1PPP####### -> C (PPP) ###-####
              country = 1;
              city = value.slice(0, 3);
              number = value.slice(3);
              break;

          case 11: // +CPPP####### -> CCC (PP) ###-####
              country = value[0];
              city = value.slice(1, 4);
              number = value.slice(4);
              break;

          case 12: // +CCCPP####### -> CCC (PP) ###-####
              country = value.slice(0, 3);
              city = value.slice(3, 5);
              number = value.slice(5);
              break;

          default:
              return tel;
      }
      if (country == 1) {
          country = "";
      }

      number = number.slice(0, 3) + '-' + number.slice(3);

      return (country + " " + city + " " + number).trim();
  };
});

/**
 * get length of object
 */
app.filter('lengthOfObject', function() {
  return function(obj) {
    if ('object' !== typeof obj) {
      return null;
    }
    return Object.keys(obj).length;
 }
});

/**
 * Validate SSN number format
 */
app.filter('ssnFilter', function() {
  return function(value, mask) {
    var len, val;
    if (mask == null) {
      mask = false;
    }
    if (value) {
      val = value.toString().replace(/\D/g, "");
      len = val.length;
      if (len < 4) {
        return val;
      } else if ((3 < len && len < 6)) {
        if (mask) {
          return "***-" + (val.substr(3));
        } else {
          return (val.substr(0, 3)) + "-" + (val.substr(3));
        }
      } else if (len > 5) {
        if (mask) {
          return "***-**-" + (val.substr(5, 4));
        } else {
          return (val.substr(0, 3)) + "-" + (val.substr(3, 2)) + "-" + (val.substr(5, 4));
        }
      }
    }
    return value;
  }
});

/**
 * Reverse SSN
 */
app.filter("ssnReverse", function() {
  return function(value) {
    if (!!value) {
      return value.replace(/\D/g, "").substr(0, 9);
    }
    return value;
  };
});

/**
 * Set number of fixed length
 */
app.filter('numberFixedLen', function () {
  return function (n, len) {
    var num = parseInt(n, 10);
    len = parseInt(len, 10);
    if (isNaN(num) || isNaN(len)) {
        return n;
    }
    num = '' + num;
    while (num.length < len) {
        num = '0'+num;
    }
    return num;
  };
});

/**
 * get array started from some number
 */
app.filter('startFrom', function () {
	return function (input, start) {
		if (input) {
			start = +start;
			return input.slice(start);
		}
		return [];
	};
});

/**
 * Filter phone
 */
app.filter('phoneFilter', function() {
  return function(value) {
    var len, val;
    if (value) {
      val = value.toString().replace(/\D/g, "");
      len = val.length;
      if (len < 4) {
        return  val;
      } else if ((3 < len && len < 7)) {
          return "(" + (val.substr(0, 3)) + ") " + (val.substr(3));
      } else if (len > 6) {
          return "(" + (val.substr(0, 3)) + ") " + (val.substr(3, 3)) + "-" + (val.substr(6, 4));
      }
    }
    return value;
  }
});

/**
 * Reformat phone number
 */
app.filter('phoneDisplay', function() {
  return function(value) {
    var len, val;
    if (value) {
      val = value.toString().replace(/\D/g, "");
      len = val.length;
      if (len < 4) {
        return  val;
      } else if ((3 < len && len < 7)) {
          return "(" + (val.substr(0, 3)) + ") " + (val.substr(3));
      } else if (len > 6) {
          return "(" + (val.substr(0, 3)) + ") " + (val.substr(3, 3)) + "-" + (val.substr(6, 4));
      }
    }
    return value;
  }
});

/**
 * Reverse phone number
 */
app.filter("phoneReverse", function() {
  return function(value) {
    if (!!value) {
      return value.replace(/\D/g, "").substr(0, 10);
    }
    return value;
  };
});

/**
 * Slice array
 */
app.filter('slice', function() {
  return function(arr, start, end) {
    return (arr || []).slice(start, end);
  };
});

/**
 * Convert decimal to string
 */
app.filter('decimalConvert', function() {
  
  return function(input) {
    if (undefined == input) {
      return 0;
    }
    var str = input.toString();
    var result;
    var n =str.toString().indexOf(".");
    if(n<0){
      result = str+".00"
      return result;
    }
    
    var afterDecimal=str.substring(n+1,str.length);
    var beforeDecimal=str.substring(0,n);
    if(afterDecimal.length==1){
      afterDecimal=afterDecimal+'0';
      result=beforeDecimal+'.'+afterDecimal;
      return result ;
    }
    
    if(afterDecimal.length>5)
    {
      afterDecimal=afterDecimal.substring(0,5);
    }
    
    afterDecimal=afterDecimal.split('');
    for(var i=afterDecimal.length-1;i>=0;i--){
      if(i>1 && parseInt(afterDecimal[i])<1){
        afterDecimal.splice(i, 1);
      }else{
        break;
      }
    }
    if(afterDecimal instanceof Array){
      afterDecimal=afterDecimal.join("")
    }
    result=beforeDecimal+'.'+afterDecimal;
    return result;
    
  }
});

/**
 * Sort object elements
 */
app.filter('orderByObj', function() {
  return function(items, field, reverseOrder) {
    reverseOrder = reverseOrder ? -1 : 1;

    if ((field.charAt(0) == '+' || field.charAt(0) == '-')) {
      reverseOrder = field.charAt(0) == '-' ? -1 : 1;
      field = field.substring(1);
    }

    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      return (a[field] > b[field] ? 1 : -1) * reverseOrder;
    });

    var newItems = {};

    for (var i = 0; i < filtered.length; i++) {
      newItems[filtered[i][field]] = filtered[i];
    }
    return newItems;
  };
});