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
    $scope.mccTypeIn = ti.mcc;
    $scope.isMCCValid = true;

    var orderId = fdService.getOrderId();

    if (orderId) {
      var cart = fdService.getOrderedCart(orderId);
      cart = fdService.cartChanged(cart);
      fdService.storeTmpOrderId(orderId);
      fdService.clearOrderId();
    } else {
      var cart = fdService.getCart();
    }

      //reset cart.data product pricing
      //fdService.resetCartOverridePricing(cart);

    fdService.clearAcquiringPricing();
      //fdService.clearGlobalPricing();
      //fdService.clearEquipmentPricing();

    cart.onetimeFees = {};
    cart.mFees = {};
    cart.onetimeAmount = 0;
    cart.mfeeAmount = 0;
    cart = fdService.setPricingToCart(cart, fdService.getGlobalPricingStorage());
    cart = fdService.setPricingToCart(cart, fdService.getEquipmentPricingStorage());
      // cart.transaction_fee = null;
      if(cart.payment_types != null){
        cart.payment_types.groups = [];
      }

      for (var i in cart.transaction_products) {
        cart.transaction_products[i].parentProduct = null;
      }

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
              angular.element('[name=mcctypein]').trigger('change');
            angular.element('[name=sales]').trigger('keyup');
            angular.element('[name=ticket]').trigger('keyup');
            angular.element('[name=highestTicket]').trigger('keyup');
            angular.element('[name=amexVolume]').trigger('keyup');
              angular.element('[name=amexMemberId]').trigger('keyup');
          }, 0);
        });
      }

    });

      //isAmexPresent: A flag which holds American Express card selected or not, check if product is swiped, non swiped and telecheck
      $scope.isAmexPresent = false;
      $scope.isSwipedNonSwiped = false;
      $scope.isTeleCheck = false;
      if(cart.payment_types){
        for(var i in cart.payment_types.products){
          if(cart.payment_types.products[i].name == 'American Express')
            $scope.isAmexPresent = true;
          if(cart.payment_types.products[i].name == 'Swiped/Non Swiped')
            $scope.isSwipedNonSwiped = true;
          if(cart.payment_types.products[i].type == 'TELECHECK')
            $scope.isTeleCheck = true;
        }
      }
      if(cart.data){
        for(var i in cart.data){
          if(cart.data[i].productType == 'TELECHECK')
            $scope.isTeleCheck = true;
        }
      }
      if(cart.transaction_products){
        for(var i in cart.transaction_products){
          if(cart.transaction_products[i].type == 'TELECHECK')
            $scope.isTeleCheck = true;
        }
      }

  };

  /**
   * Initialize pricing proposal
   * @param callback function
   */
  $scope.initPricingProposal = function(callback){

    $scope.transactionFormData = {};
    var categoryName = $rootScope.cart.data[Object.keys($rootScope.cart.data)[0]].category;

    fdService.getMccCodes(categoryName)
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
    if(value === undefined)
      return;

    var categoryName = $rootScope.cart.data[Object.keys($rootScope.cart.data)[0]].category;
    fdService.getMccTypes(categoryName, value)
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
    $scope.validateCart();
    if($scope.transactionFormData.mcc >= 4){
      $scope.mccTypeIn = $scope.transactionFormData.mcc;
      $timeout(function() {
          angular.element('[name=mcctypein]').trigger('change');
          $scope.transactionInfoForm.mcctypein.$setTouched();
          $scope.isMCCValid = true;
      }, 0);
  }
    }

    /**
     * @method getMCCDetails
     * @return
     */
    $scope.getMCCDetails = function() {
        var categoryName = $rootScope.cart.data[Object.keys($rootScope.cart.data)[0]].category;
        var mccCode = $scope.mccTypeIn;
        if (mccCode === undefined || mccCode.length < 4) {
          $scope.invalidateMCCDetails();
          return;
        }
        fdService.getMCCDetails(categoryName, mccCode)
          .success(function(data, status, headers, config) {
            $scope.isMCCValid = true;
            $scope.transactionFormData.mcc = data.mcc;
            $scope.transactionFormData.mccTypes = data.industryDescription;
            $scope.getMccTypes($scope.transactionFormData.mccTypes, function() {
              $timeout(function() {
                angular.element('[name=mcccodes]').trigger('change');
                angular.element('[name=mcctypes]').trigger('change');
                showMccAdditionalDetails($scope.transactionFormData.mcc);
                $scope.validateCart();
              }, 0);
            });
          })
          .error(function(data, status, headers, config) {
            $scope.invalidateMCCDetails();
          });
      }

    /**
    * @method invalidateMCCDetails
    * @return
    */
    $scope.invalidateMCCDetails = function() {
      $scope.isMCCValid = false;
      $scope.transactionFormData.mccTypes = '';
      $scope.transactionInfoForm.mcccodes.$setTouched();
      $timeout(function() {
        angular.element('[name=mcccodes]').trigger('change');
        if ($scope.transactionInfoForm.mcctypes) {
          angular.element('[name=mcctypes]').trigger('change');
          $scope.transactionInfoForm.mcctypes.$setTouched();
        }
      }, 0);
    }

    /**
     * @method showMccAdditionalDetails
     * @param {} miscVal
     * @return
     */
    function showMccAdditionalDetails(miscVal) {
      if (miscVal % 100 == 99)
        $scope.misc99 = true;
      else
        $scope.misc99 = false;
    }


    /**
     * @method getTransactionForm
     * @return MemberExpression
     */
    $rootScope.getTransactionForm = function(){
      return $scope.transactionInfoForm;
    };
    /**
     * @method getTransactionFormData
     * @return MemberExpression
     */
    $rootScope.getTransactionFormData = function(){
      return $scope.transactionFormData;
    };
    /**
     * @method updateLeadStatus
     * @return MemberExpression
     */
    $rootScope.updateLeadStatus = function() {
        $rootScope.isLeadSelected = false;
        if (fdService.getCDFromSession()) {
            $rootScope.isLeadSelected = true;
        } else {
            $timeout(function() {
                $rootScope.openPane();
            }, 200);
        }
    };

    /**
     * Validate Cart
     */
    $scope.validateCart = function () {
      fdService.validateCart($rootScope.cart, $scope.transactionFormData)
          .success(function(data, status, headers, config) {
            $rootScope.cart.validation = data;
            $rootScope.cart = fdService.cartChanged($rootScope.cart);
          });
    };

    /**
     * validate cart on average ticket changed
     */
    $scope.avgTicketChanged = function () {

      $rootScope.cart.validation.iscartvalid = false;
      if ($scope.toATS) {
        $timeout.cancel($scope.toATS);
      }

      $scope.toATS = $timeout(function () {
        $scope.validateCart();
      }, 1000);
    };

    /**
    * validate the annual sales volume
    */
    $scope.checkAnnualSalesVolume = function () {

      var totalVol;
      if($scope.transactionFormData.annualcardVolume && $scope.transactionFormData.telecheckVolume){
          totalVol = parseFloat($scope.transactionFormData.annualcardVolume) + parseFloat($scope.transactionFormData.telecheckVolume);
        if($scope.transactionFormData.amexVolume){
          totalVol = totalVol + parseFloat($scope.transactionFormData.amexVolume);
        }
      } else {
          return;
      }

      if($scope.transactionFormData.annualVolume > totalVol) {
         $scope.transactionInfoForm.sales.$setValidity('maxError', true);
      } else {
         $scope.transactionInfoForm.sales.$setValidity('maxError', false);
      }

    };

  ///////////////// MAIN ////////////////////////////////
  _init();
  
}]);