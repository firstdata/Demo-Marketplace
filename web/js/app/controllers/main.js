/**
 * Main Controller
 */
app.controller('MainCtrl', ['$scope', '$rootScope', '$filter', '$location', 'fdService', '$timeout', '$anchorScroll', '$window', 'CONST', '$routeParams',
    function ($scope, $rootScope, $filter, $location, fdService, $timeout, $anchorScroll, $window, CONST, $routeParams) {

  /**
   * Init function
   * @private
   */
  var _init = function(){
    $scope.Math = window.Math;
    $rootScope.CONST = CONST;

    $rootScope.cart = fdService.getCart();

    $rootScope.placeholderImageUrl = 'img/placeholder-product.jpg';

    $scope.$watch(function () {
      return fdService.getOrderId();
    }, function (newVal, oldVal) {
      $scope.orderId = fdService.getOrderId();
    }, true);

  };

  ///////////////// MAIN ////////////////////////////////
  _init();
}]);