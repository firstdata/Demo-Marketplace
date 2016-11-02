/**
 * Transaction Info Controller
 */
app.controller('TransactionInfoCtrl', ['$scope', '$rootScope', '$filter', '$location', '$routeParams', 'fdService', '$timeout',
    function ($scope, $rootScope, $filter, $location, $routeParams, fdService, $timeout) {

  /**
   * Init function
   * @private
   */
  var _init = function(){

    $rootScope.body_id = 'shipping';
    $scope.transactionFormData = {};

    $scope.category = fdService.getCategoryFromSession();
    var ti = fdService.getTransactionInfo();

    var cart = fdService.getCart();

    fdService.clearAcquiringPricing();
    fdService.clearGlobalPricing();
    fdService.clearEquipmentPricing();

    cart.onetimeFees = {};
    cart.mFees = {};
    cart.onetimeAmount = 0;
    cart.mfeeAmount = 0;

    cart = fdService.setPricingToCart(cart, fdService.getGlobalPricingStorage());
    cart = fdService.setPricingToCart(cart, fdService.getEquipmentPricingStorage());
    cart.transaction_fee = null;

    cart = fdService.setPricingToCart(cart, fdService.getAcquiringPricingStorage());
    $rootScope.cart = fdService.cartChanged(cart);


    // Autopopulate transaction info from the session
    $scope.initPricingProposal(function(){
      if (ti.mccTypes) {
        $scope.getMccTypes(ti.mccTypes, function(){
          $scope.transactionFormData = ti;
          showMccAdditionalDetails($scope.transactionFormData.mcc);
          $timeout(function() {
            angular.element('[name=mcccodes]').trigger('change');
            angular.element('[name=mcctypes]').trigger('change');
            angular.element('[name=sales]').trigger('keyup');
            angular.element('[name=ticket]').trigger('keyup');
            angular.element('[name=highestTicket]').trigger('keyup');
            angular.element('[name=amexVolume]').trigger('keyup');
          }, 0);
        });
      }
    });
  };

  /**
   * Show MCC additional details
   * @private
   * @param miscVal
   */
  var showMccAdditionalDetails = function(miscVal) {
    if (miscVal % 100 == 99)
      $scope.misc99 = true;
    else
      $scope.misc99 = false;
  };

  /**
   * Initialize pricing proposal
   * @param callback function
   */
  $scope.initPricingProposal = function(callback){

    $scope.transactionFormData = {};

    fdService.getMccCodes($scope.category.name)
    .success(function(data, status, headers, config) {
      $scope.mccCodes = data;
      if (callback) {
        callback.apply(this, []);
      }

    })
    .error(function(data, status, headers, config) {
      console.log('error')
    });
  };

  /**
   * Get MCC Code by category and type
   * @param value
   * @param callback
   */
  $scope.getMccTypes = function(value, callback){
    $scope.mccTypes = [];
    fdService.getMccTypes($scope.category.name, value)
      .success(function(data, status, headers, config) {
        $scope.mccTypes = data;
        if (callback) {
          callback.apply(this, []);
        }
      })
      .error(function(data, status, headers, config) {
        console.log('error')
      });
  };

  /**
   * Check Misc 99
   */
  $scope.checkMisc99 = function() {
    showMccAdditionalDetails($scope.transactionFormData.mcc);
  }

  ///////////////// MAIN ////////////////////////////////
  _init();
  
}]);