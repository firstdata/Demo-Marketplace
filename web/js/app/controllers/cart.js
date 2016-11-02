/**
 * Cart Controller
 */
app.controller('CartCtrl', ['$scope', '$rootScope', '$window', 'fdService', '$routeParams', 'CONST', '$location', '$timeout',
    function ($scope, $rootScope, $window, fdService, $routeParams, CONST, $location, $timeout) {

  /**
   * Init function
   * @private
   */
  var _init = function(){

    $scope.clickedCheckout = false;
    $scope.showRecFee = true;
    $scope.transactionFee = true;
    $scope.allowExpand = true;

    $scope.page = $routeParams.page;


    $scope.orderId = fdService.getOrderId();

    $rootScope.cart = fdService.getCart();

    $scope.$watch(function () {
      return $window.sessionStorage;
    }, function (newVal, oldVal) {
      $scope.orderId = fdService.getOrderId();
    }, true);

    $scope.$watch(function () {
      return $rootScope.cart;
    }, function (newVal, oldVal) {
      $scope.cart = newVal;
    }, true);

    if (('shipping' == $scope.page && $scope.orderId) || 'thankyou' == $scope.page) {
      $scope.allowExpand = false;
      $scope.cart = $rootScope.cart = fdService.getOrderedCart($scope.orderId);
    }
  };

  /**
   *
   * remove product from cart
   * @param pid product Id
   */
  $scope.removeFromCart = function(pid){
    delete $rootScope.cart.data[pid];
    fdService.validateCart($rootScope.cart)
      .success(function(data, status, headers, config) {
        $rootScope.cart.validation = data;
        $scope.cartChanged();
      })
      .error(function(data, status, headers, config) {
        console.log('error');
      });
      
    fdService.updatePricing();
    $scope.cartChanged();
  };

  /**
   * Calling in case of changing quantity.
   */
  $scope.qtyChanged = function(){
    fdService.updatePricing();
    $scope.cartChanged();
  };

  /**
   * Calling in case of changing cart.
   */
  $scope.cartChanged = function(){
    fdService.clearOrderId();
    $rootScope.cart = $scope.cart = fdService.cartChanged($scope.cart);
    $scope.orderId = fdService.getOrderId();
  };

  /**
   * Remove lease from cart
   * @param p product object
   */
  $scope.removeLease = function(p){
    $scope.cart.data[p.id].term = CONST.PURCHASE_CODE;
    fdService.validateCart($scope.cart)
      .success(function(data, status, headers, config) {
        $scope.cart.validation = data;
        $scope.cartChanged();
      })
      .error(function(data, status, headers, config) {
        console.log('error');
      });
    
    fdService.updatePricing();
    $scope.cartChanged();
  };

  /**
   * Remove processing product from cart
   * @param p processing product object
   */
  $scope.removeProcessing = function(p){
    delete $scope.cart.payment_types.products[p.id];
    if (!Object.keys($scope.cart.payment_types.products).length) {
      $scope.cart.payment_types = null;
    }
    fdService.validateCart($scope.cart)
      .success(function(data, status, headers, config) {
        $scope.cart.validation = data;
        $scope.cartChanged();
      })
      .error(function(data, status, headers, config) {
        console.log('error');
      });

    fdService.updatePricing();
    $scope.cartChanged();
  };

  /**
   * Remove payment types from cart
   */
  $scope.removePaymentTypes = function(){
    $scope.cart.payment_types = null;
    fdService.validateCart($scope.cart)
      .success(function(data, status, headers, config) {
        $scope.cart.validation = data;
        $scope.cartChanged();
      })
      .error(function(data, status, headers, config) {
        console.log('error');
      });
      
    fdService.updatePricing();
    $scope.cartChanged();
  };

  /**
   * Change payment type to lease
   * @param p leasing product object
   */
  $scope.leaseProduct = function(p){
    $rootScope.cart = $scope.cart = fdService.leaseProduct(p, $scope.cart, p.id);
    $scope.showRecFee = true;
    fdService.updatePricing();
    fdService.validateCart($scope.cart)
      .success(function(data, status, headers, config) {
        $scope.cart.validation = data;
        $scope.cartChanged();
      })
      .error(function(data, status, headers, config) {
        console.log('error');
      });
  };

  /**
   * Save transaction info
   */
  $scope.saveTransactionInfo = function(){

    $scope.transactionFormData.category = $scope.category.name;
    fdService.storeTransactionInfo($scope.transactionFormData);
    
    fdService.initPricingData(function(status){
      if (status) {
        $rootScope.cart = $scope.cart = fdService.getCart();
        $location.path('/checkout/shipping');
      } else {
        $location.path('400');
      }
    });
  };

  /**
   * Get transaction info
   * @return {Object} with transaction info
   */
  $scope.getTI = function(){
    return fdService.getTransactionInfo();
  };

  /**
   * Place order
   */
  $scope.placeOrder = function(){
    var orderId = fdService.getOrderId();
    fdService.placeOrder(orderId)
      .success(function(data, status, headers, config) {
        var cart = fdService.getCart();
        fdService.storeOrderId(data.orderId);
        fdService.storeOrderedCart(data.orderId, cart);
        $scope.gotoUrl('/checkout/thankyou');
      })
      .error(function(data, status, headers, config) {
        console.log('error');
        $location.path('400');
      });
  };

  /**
   * Redirect to url
   * @param url where to redirect
   */
  $scope.gotoUrl = function(url){
    $location.path(url);
  };

  /**
   * Redirect to the checkout page or transation info
   */
  $scope.proceedToCheckout = function(){
    if ($scope.getTI()) {
      var url = '/checkout/shipping';
    } else {
      var url = '/transaction/info';
    }
    $scope.gotoUrl(url);
  };

  /**
   * Check if cart edit is allowed
   * @return {boolean}
   */
  $scope.isAllowEdit = function(){
    if ('shipping' == $scope.page) {
      return false;
    }
    if ('thankyou' == $scope.page) {
      return false;
    }
    if ('summary' == $scope.page) {
      return false;
    }
    if ('proposal' == $scope.page) {
      return false;
    }
    if ('transaction_info' == $scope.page) {
      return false;
    }
    
    return true;
  };
  
  ///////////////// MAIN ////////////////////////////////

  _init();
  
}]);