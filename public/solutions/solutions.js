'use strict';

angular.module('solutions', ['ngRoute', 'ui.router'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/solutions/:category?', {
    templateUrl: 'public/solutions/solutions.html',
    controller: 'solutionsCtrl'
  });
}])

.controller('solutionsCtrl', ['$routeParams', '$scope', '$http', 'myService', function($routeParams, $scope, $http, myService) {
  $scope.products = [];
  $scope.category = myService.getCategory();
  
  $http({
    method: 'GET',
    url: 'https://dev.services.firstdata.com/v1/products/386/company/'
  }).then(function successCallback(response) {
      for (var i = 0; i < response.data.length; i++) {
        if (response.data[i].categoryIds.includes(parseInt($routeParams.category))) {
          $scope.products.push(response.data[i]);
        }
      }
  }, function errorCallback(response) { /* some error handeling...need UI */ });


  if (![].includes) {
    Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
      'use strict';
      var O = Object(this);
      var len = parseInt(O.length) || 0;
      if (len === 0) {
        return false;
      }
      var n = parseInt(arguments[1]) || 0;
      var k;
      if (n >= 0) {
        k = n;
      } else {
        k = len + n;
        if (k < 0) {k = 0;}
      }
      var currentElement;
      while (k < len) {
        currentElement = O[k];
        if (searchElement === currentElement ||
           (searchElement !== searchElement && currentElement !== currentElement)) {
          return true;
        }
        k++;
      }
      return false;
    };
  }
}]);
