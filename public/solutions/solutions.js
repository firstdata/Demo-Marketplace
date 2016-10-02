'use strict';

angular.module('solutions', ['ngRoute', 'ui.router'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/solutions/:category?', {
    templateUrl: 'public/solutions/solutions.html',
    controller: 'solutionsCtrl'
  });
}])

.controller('solutionsCtrl', ['$routeParams', '$scope', '$http', function($routeParams, $scope, $http) {
  console.log($routeParams.category);
}]);
