'use strict';

angular.module('products', ['ngRoute', 'ui.router'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/products/:id?', {
    templateUrl: 'public/products/products.html',
    controller: 'productsCtrl'
  });
}])

.controller('productsCtrl', ['$routeParams', '$scope', '$http', function($routeParams, $scope, $http) {

$scope.product = '';
$scope.productIncludes = '';
$scope.productFeatures = '';

  $http({
    method: 'GET',
    url: 'https://dev.services.firstdata.com/v1/products/' + $routeParams.id + '/details/'
  }).then(function successCallback(response) {
    $scope.product = response;

    }, function errorCallback(response) {
        //alert('An error occurred. Please refresh the page');
    });



      $http({
        method: 'GET',
        url: 'https://dev.services.firstdata.com/v1/products/' + $routeParams.id + '/features/'
      }).then(function successCallback(response) {
        $scope.productFeatures = response;
        console.log($scope.productFeatures.data[0]);
        }, function errorCallback(response) {
            //alert('An error occurred. Please refresh the page');
        });


}]);
