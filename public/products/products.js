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
$scope.productFAQ = '';
$scope.productSpecs = '';
$scope.productRecommended = '';

  $http({
    method: 'GET',
    url: 'https://dev.services.firstdata.com/v1/products/' + $routeParams.id + '/details/'
  }).then(function successCallback(response) {
      $scope.product = response;
  }, function errorCallback(response) { });

  $http({
    method: 'GET',
    url: 'https://dev.services.firstdata.com/v1/products/' + $routeParams.id + '/includes/'
  }).then(function successCallback(response) {
      $scope.productIncludes = response;
  }, function errorCallback(response) { });

  $http({
    method: 'GET',
    url: 'https://dev.services.firstdata.com/v1/products/' + $routeParams.id + '/features/'
  }).then(function successCallback(response) {
    $scope.productFeatures = response;
    }, function errorCallback(response) { });

  $http({
    method: 'GET',
    url: 'https://dev.services.firstdata.com/v1/faq/' + $routeParams.id
  }).then(function successCallback(response) {
    $scope.productFAQ = response;
    }, function errorCallback(response) { });

    $http({
      method: 'GET',
      url: 'https://dev.services.firstdata.com/v1/products/' + $routeParams.id + '/specs/'
    }).then(function successCallback(response) {
      $scope.productSpecs = response;
      }, function errorCallback(response) { });

    $http({
      method: 'GET',
      url: 'https://dev.services.firstdata.com/v1/products/' + $routeParams.id + '/recommended/'
    }).then(function successCallback(response) {
      console.log(response);
      $scope.productRecommended = response;
      }, function errorCallback(response) { });

}]);
