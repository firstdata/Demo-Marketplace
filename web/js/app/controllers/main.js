/**
 * Main Controller
 */
app.controller('MainCtrl', ['$scope', '$rootScope', '$filter', '$location', 'fdService', '$timeout', '$anchorScroll', '$window', 'CONST', '$routeParams',
  function($scope, $rootScope, $filter, $location, fdService, $timeout, $anchorScroll, $window, CONST, $routeParams) {

    /**
     * Redirect to checkout page
     * @method proceedToCheckout
     */
    $scope.proceedToCheckout = function() {
      var ep = fdService.getEquipmentPricingStorage();
      var ti = fdService.getTransactionInfo();
      var url;


      if ($rootScope.cart.num_locations > 1 && !$rootScope.cart.num_locations_selected) {
        url = '/multi-locations';
      } else if (ti && ep) {
        url = '/checkout/shipping';
      } else {
        url = '/transaction/info';
      }

      $timeout(function() {
        $rootScope._setPaneDefaultPage();
        $location.path(url);
      });
    };

    /**
     * Get Shipping Methods Function
     * @method getShippingMethods
     * @return
     */
    $scope.getShippingMethods = function() {
      if (!fdService.getSessionShippingMethods()) {
        fdService.getShippingMethods()
          .success(function(data, status, headers, config) {
            var shippingOptions = {};
            data.sort(function(a, b) {
              return a.price - b.price;
            });
            for (var i = 0; i < data.length; i++) {
              data[i].name = data[i].productShortDescription;
              shippingOptions[i + 1] = data[i];
            }
            fdService.storeShippingMethods(shippingOptions);
          })
          .error(function(data, status, headers, config) {
            $location.path('400');
          });
      }
    };

    /**
     * Init function
     * @private
     */
    var _init = function() {
      $scope.Math = window.Math;
      $rootScope.wrapperId = 'main-wrapper';
      $rootScope.CONST = CONST;
      $rootScope.headerTpl = 'templates/header.tpl';
      $rootScope.cart = fdService.getCart();
      //$scope.getShippingMethods();

      $scope.$watch(function() {
        return fdService.getOrderId();
      }, function(newVal, oldVal) {
        $scope.orderId = fdService.getOrderId();
      }, true);

      $rootScope.placeholderImageUrl = 'img/placeholder-product.jpg';
      // Check if touch device
      if ('ontouchstart' in window || navigator.maxTouchPoints) {
        $rootScope.isTouch = true;
      } else {
        $rootScope.isTouch = false;
      }
      $scope.currentYear = new Date().getFullYear();
    };

    ///////////////// MAIN ////////////////////////////////
    _init();
  }
]);