'use strict';

angular.module('shipping', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/shipping', {
    templateUrl: 'public/shipping/shipping.html',
    controller: 'shippingCtrl'
  });
}])

.controller('shippingCtrl', ["$scope","$http", "myService", function ($scope, $http, myService) {
  $scope.categories = [];
  $scope.products = myService.get();
  $scope.total = 0;

  for (var i = 0; i < $scope.products.length; i++) {
    $scope.total += $scope.products[i].price;
  }

  $scope.shippingPrice = function(value) {
      $scope.total += parseInt(value);
      console.log($scope.total);
  };

  $scope.removeItem = function(index) {
    myService.remove(index);

    if (myService.get().length == 0) {
      alert('Your Cart is Empty. Please select an item.')
    }
  }
}]);
