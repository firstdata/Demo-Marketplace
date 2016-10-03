'use strict';

angular.module('confirmation', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/confirmation', {
    templateUrl: 'public/confirmation/confirmation.html',
    controller: 'confirmationCtrl'
  });
}])

.controller('confirmationCtrl', ["$scope","$http", "myService", function ($scope, $http, myService) {
  $scope.categories = [];
  $scope.products = myService.get();
  $scope.total = 0;

console.log('my service');

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

  $http({
    method: 'GET',
    url: 'https://stage.services.firstdata.com//v1/categories'
  }).then(function successCallback(response) {
      for (var i = 0; i < response.data.length; i++) {
        //console.log(response.data[i]);
        $scope.categories.push(response.data[i]);
      }
    }, function errorCallback(response) {
        //alert('An error occurred. Please refresh the page');
    });



}]);
