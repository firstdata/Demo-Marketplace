'use strict';

angular.module('store', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/store', {
    templateUrl: 'public/store/store.html',
    controller: 'storeCtrl'
  });
}])

.factory("shoppingcart", [function() {
    return {};
}])

.controller('storeCtrl', ["$scope","$http", "myService", function ($scope, $http, myService) {
  $scope.categories = [];
  $scope.products = [];

  $scope.setCat = function(cat) {
    myService.setCategory(cat);
  }

  $http({
    method: 'GET',
    url: '/categories'
  }).then(function successCallback(response) {
      for (var i = 0; i < response.data.length; i++) {
        //console.log(response.data[i]);
        $scope.categories.push(response.data[i]);
      }
    }, function errorCallback(response) {
        //alert('An error occurred. Please refresh the page');
    });

    $http({
      method: 'GET',
      url: '/products'
    }).then(function successCallback(response) {
        for (var i = 0; i < response.data.length; i++) {
          //console.log(response.data[i]);
          $scope.products.push(response.data[i]);
        }
      }, function errorCallback(response) {
      });
}]);
