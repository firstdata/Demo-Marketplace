'use strict';

angular.module('application', ['ngRoute' ])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/application', {
    templateUrl: 'public/signup/application.html',
    controller: 'applicationCtrl'
  });
}])

.controller('applicationCtrl', ["$scope","$http", "FDService", function ($scope, $http, FDService) {
  $scope.categories = [];

  console.log('hello');

}]);
