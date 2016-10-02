'use strict';

angular.module('products', ['ngRoute', 'ui.router'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/solutions/:category?', {
    templateUrl: 'public/solutions/solutions.html',
    controller: 'productsCtrl'
  });
}])

.controller('productsCtrl', ['$routeParams', '$scope', '$http', function($routeParams, $scope, $http) {
  console.log($routeParams.category);
}]);
