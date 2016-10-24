'use strict';

angular.module('products', ['ngRoute', 'ui.router'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/products/:id?', {
    templateUrl: 'public/products/products.html',
    controller: 'productsCtrl'
  });
}])

.factory("shoppingcart", [function() {
    return {};
}])

.controller('productsCtrl', ['$routeParams', '$scope', '$http', 'FDService', function($routeParams, $scope, $http, FDService) {
  $scope.product = '';
  $scope.productIncludes = '';
  $scope.productFeatures = '';
  $scope.productFAQ = '';
  $scope.productSpecs = '';
  $scope.productRecommended = '';
  $scope.defaultImg = '';

  $http({
    method: 'GET',
    url: '/products/' + $routeParams.id + '/details'
  }).then(function successCallback(response) {
      $scope.product = response;
      $scope.defaultImg = response.data.imageUrls[0];
  }, function errorCallback(response) { });

  $http({
    method: 'GET',
    url: '/products/' + $routeParams.id + '/includes'
  }).then(function successCallback(response) {
      $scope.productIncludes = response;
  }, function errorCallback(response) { });

  $http({
    method: 'GET',
    url: '/products/' + $routeParams.id + '/features'
  }).then(function successCallback(response) {
    $scope.productFeatures = response;
    }, function errorCallback(response) { });

  $http({
    method: 'GET',
    url: '/products/' + $routeParams.id + '/faq'
  }).then(function successCallback(response) {
    $scope.productFAQ = response;
    }, function errorCallback(response) { });

  $http({
    method: 'GET',
    url: '/products/' + $routeParams.id + '/specs'
  }).then(function successCallback(response) {
    $scope.productSpecs = response;
    }, function errorCallback(response) { });

  $http({
    method: 'GET',
    url: '/products/' + $routeParams.id + '/recommended'
  }).then(function successCallback(response) {
    $scope.productRecommended = response;
    }, function errorCallback(response) { });

    $scope.addCart = function(id, qty, price, name) {
      FDService.set({
        id: id,
        qty: qty,
        price: price,
        name: name
      });

      $scope.updateImg = function(url) {
        $scope.defaultImg = url;
      };

    };

}]);
