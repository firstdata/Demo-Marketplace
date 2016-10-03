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

  console.log(myService.get()[0].name);
  console.log('products are ' + $scope.products);

  $scope.removeItem = function(index) {
    myService.remove(index);
    console.log(myService.get().length);

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
