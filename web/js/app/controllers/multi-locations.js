/**
 * Multi Locations Controller
 */
app.controller('MultiLocationsCtrl', ['$scope', '$rootScope', '$window', 'fdService', '$routeParams', '$location', 'CONST',
  function($scope, $rootScope, $window, fdService, $routeParams, $location, CONST) {

    /**
     * init function
     * @private
     */
    var _init = function() {

      $scope.orderId = fdService.getOrderId();

      if ($scope.orderId) {
        $scope.cart = $rootScope.cart = fdService.getOrderedCart($scope.orderId);
      } else {
        $scope.cart = $rootScope.cart = fdService.getCart();
      }

      // on cart changed
      var offCartChanged = $rootScope.$on('cart-changed', function(e, cart) {
        $scope.cart = cart;
      });

      // Clear pricing
      fdService.clearAcquiringPricing();
      fdService.clearGlobalPricing();
      fdService.clearEquipmentPricing();

      $rootScope.cart = fdService.cartChanged($scope.cart);

      // Destroy on cart changed when scope destroyed to avoid multiple calls
      $scope.$on('$destroy', function() {
        offCartChanged();
      });
    };

    /**
     * change number of selected locations
     * @method changeNumber
     * @param {number} n
     */
    $scope.changeNumber = function(n) {

      if ($scope.cart.num_locations < n) {
        n = $scope.cart.num_locations;
      }
      $scope.cart.num_locations_selected = n;
      $rootScope.cart = fdService.cartChanged($scope.cart);
    };

    ///////////////// MAIN ////////////////////////////////
    _init();
  }
]);