/**
 * Checkout Controller
 */
app.controller('CheckoutCtrl', ['$scope', '$rootScope', '$routeParams', '$filter', '$location', '$window', '$timeout', 'fdService',
    function ($scope, $rootScope, $routeParams, $filter, $location, $window, $timeout, fdService) {

  /**
   * Init function
   * @private
   */
  var _init = function(){
    $rootScope.body_id = 'checkout';
    $rootScope.bodyClass = '';

    $scope.warningFlag = false;

    $scope.shippingMethod = 'free';

    $scope.placeOrderInProgress = false;
    $scope.signupInProgress = false;

    $scope.form_error = false;

    $scope.monthlyFee = false;
    $scope.transactionFee = false;

    $scope.phoneNumberPattern = (/^\([0-9]{3}\)\s[0-9]{3}-[0-9]{4}$/);
    $scope.addressPattern = (/^[a-zA-Z0-9',\s][^{}|~]*$/);
    $scope.companyPattern = (/^[a-zA-Z0-9',\s][^{}|~]*$/);

    $scope.orderId = fdService.getOrderId();

    $scope.states_list = $rootScope.CONST.STATES;

    if ($scope.orderId) {
      $scope.cart = $rootScope.cart = fdService.getOrderedCart($scope.orderId);
    } else {
      $scope.cart = $rootScope.cart = fdService.getCart();
    }
    $scope.page = $routeParams.page;

    if ('shipping' == $scope.page) {
      $timeout(function() {

        angular.forEach($scope.shippingForm.$error, function (field) {
          angular.forEach(field, function(errorField){
            if (errorField.$viewValue) {
              errorField.$setTouched();
              errorField.$setDirty();
            }
          })
        });
      }, 0);
      $rootScope.body_id = 'shipping';

    } else if ('thankyou' == $scope.page) {
      $rootScope.bodyClass = 'checkout';
    }

    $scope.$on('$locationChangeStart', function(evt, absNewUrl, absOldUrl) {
      absOldUrl = absOldUrl.split('#');
      absNewUrl = absNewUrl.split('#');
      if (!$scope.warningFlag && absNewUrl[1] == '/transaction/info' && absOldUrl[1] == '/checkout/shipping') {
        evt.preventDefault();
        $timeout(function() {
          angular.element('.backButtonClass').trigger('click');
        });
      }
    });
  };

  /**
   * Redirect to transaction info
   */
  $scope.gotoTransaction = function() {
    $scope.warningFlag = true;
    $location.path("/transaction/info");
    angular.element('.modal-backdrop').removeClass('modal-backdrop');
    angular.element('body').css('overflow','auto');
  };

  /**
   * Call this method when cart was changed
   */
  $scope.cartChanged = function(){
    if ($scope.orderId) {
      $rootScope.cart = $scope.cart = fdService.orderedCartChanged($scope.orderId, $scope.cart);
    } else {
      $rootScope.cart = $scope.cart = fdService.cartChanged($rootScope.cart);
    }
  };

  /**
   * Call this method when shipping method was changed
   */
  $scope.shippingMethodChanged = function(){
    $rootScope.cart = $scope.cart;
    $scope.cartChanged();
  };

  /**
   * Redirect to the signup page
   */
  $scope.gotoSignup = function(){
    if ($scope.signupInProgress) {
      return;
    }
    $window.location.href = '/v1/signup/' + $scope.order_hash;
    $scope.signupInProgress = true;
  };

  /**
   * Redirect to the summary page
   */
  $scope.gotoSummary = function () {
    $rootScope.cart = $scope.cart;
    $scope.cartChanged();
    $location.path('/checkout/summary');
  }

  /**
   * Lookup city and state by zip code using google API
   */
  $scope.lookupZip = function(){
    if (!$scope.cart.shippingAddress.zip) {
      return;
    }

    fdService.lookupByZip($scope.cart.shippingAddress.zip, function(city, state){
      if (!city || !state) {
        return;
      }
      $scope.cart.shippingAddress.city = city;
      $scope.cart.shippingAddress.state = state;
      $timeout(function() {
        angular.element('[name=state]').trigger('change');
        angular.element('[name=city]').trigger('keyup');

        angular.forEach($scope.shippingForm.$error, function (field) {
          angular.forEach(field, function(errorField){
            if (errorField.$viewValue) {
              errorField.$setTouched();
            }
          })
        });

      }, 0);
    });
  };

  ///////////////// MAIN ////////////////////////////////
  _init();
}]);