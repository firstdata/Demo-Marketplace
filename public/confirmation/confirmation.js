'use strict';

angular.module('confirmation', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/confirmation', {
    templateUrl: 'public/confirmation/confirmation.html',
    controller: 'confirmationCtrl'
  });
}])

.controller('confirmationCtrl', ["$scope","$http", "FDService", function ($scope, $http, FDService) {
  $scope.categories = [];
  $scope.products = FDService.get();
  $scope.total = 0;

  for (var i = 0; i < $scope.products.length; i++) {
    $scope.total += $scope.products[i].price;
  }

  $scope.shippingPrice = function(value) {
      $scope.total += parseInt(value);
  };

  $scope.removeItem = function(index) {
    FDService.remove(index);

    if (FDService.get().length == 0) {
      alert('Your Cart is Empty. Please select an item.')
    }
  }
}]);
