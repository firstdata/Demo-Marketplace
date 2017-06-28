/**
 * Cart Controller
 */
app.controller('CartCtrl', ['$scope', '$rootScope', '$window', 'fdService', '$routeParams', 'CONST', '$location', '$timeout', 'filterFilter',
    function ($scope, $rootScope, $window, fdService, $routeParams, CONST, $location, $timeout, filterFilter) {

  /**
   * Init function
   * @private
   */
  var _init = function(){

    $scope.clickedCheckout = false;
    $scope.showRecFee = true;
    $scope.transactionFee = true;
    $scope.disableReviewOrder = false;
    $scope.allowExpand = true;

    $scope.acquiringPricing = [];
    $scope.equipmentPricing = [];
    $scope.globalPricing = [];

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

          if (($scope.orderId &&
                ('shipping' == $scope.page
                    || 'multi-locations' == $scope.page
                    || 'transaction_info' == $scope.page
                  ))
                  || 'thankyou' == $scope.page
                  || 'summary' == $scope.page
                  || 'proposal' == $scope.page) {

      $scope.allowExpand = false;
      $scope.cart = $rootScope.cart = fdService.getOrderedCart($scope.orderId);
    }

    $("#view-fees-modal").on('show.bs.modal', function () {
      $scope.acquiringPricing = fdService.getAcquiringPricingStorage();
      console.log($scope.acquiringPricing)
      $scope.equipmentPricing = fdService.getEquipmentPricingStorage();
      $scope.globalPricing = fdService.getGlobalPricingStorage();
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });
  };

  /**
   *
   * remove product from cart
   * @param pid product Id
   */
        $scope.removeFromCart = function(index){
            $rootScope.cart.data.splice(index, 1);
            // delete $rootScope.cart.data[pid];
    fdService.validateCart($rootScope.cart)
      .success(function(data, status, headers, config) {
        $rootScope.cart.validation = data;
        $scope.cart = $rootScope.cart;
        $scope.cartChanged();
        if(data.iscartvalid)
            fdService.updatePricing();
      })
      .error(function(data, status, headers, config) {
        console.log('error');
      });
      
            $scope.cart = $rootScope.cart;
    $scope.cartChanged();

            if (0 === $scope.cart.total_qty) {
                $location.path('/');
            }
  };

  /**
   * Calling in case of changing quantity.
   */
  $scope.qtyChanged = function(){
            fdService.resetCartOverridePricing($scope.cart);
            fdService.updatePricing(function(){
                $rootScope.cart = $scope.cart = fdService.getCart();
            });
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
                if(data.iscartvalid)
                    fdService.updatePricing();
            })
            .error(function(data, status, headers, config) {
                console.log('error');
            });

        $scope.cartChanged();
    };

    /**
     * remove transaction product
     * @param p
     */
    $scope.removeTransactionProduct = function(p){

      var index =  $rootScope.cart.transaction_products.map(function(e) { return e.id; }).indexOf(p.id);

      if (-1 === index) {
        return;
      }

      $rootScope.cart.transaction_products.splice(index, 1);

        fdService.validateCart($scope.cart)
            .success(function(data, status, headers, config) {
                $scope.cart.validation = data;
                $scope.cartChanged();
                if(data.iscartvalid)
                    fdService.updatePricing();
            })
            .error(function(data, status, headers, config) {
                console.log('error');
            });

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
                    if(data.iscartvalid)
                        fdService.updatePricing();
      })
      .error(function(data, status, headers, config) {
        console.log('error');
      });

    $scope.cartChanged();
  };

  /**
   * Lease product
   * @param {Object} p product
   */
    $scope.leaseProduct = function(p){

        var index = fdService.getCartProductIndex($rootScope.cart, p);
        $scope.cart.data.splice(index, 1);

        $rootScope.cart = $scope.cart = fdService.leaseProduct(p, $scope.cart, p.category);
        $scope.showRecFee = true;
        fdService.validateCart($scope.cart)
            .success(function(data, status, headers, config) {
                $scope.cart.validation = data;
                $scope.cartChanged();
                if(data.iscartvalid)
                    fdService.updatePricing();
            })
            .error(function(data, status, headers, config) {
                console.log('error');
            });
    };

  /**
         * Save transaction info in session
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
            },null,fdService.getEquipmentPricingStorage(),fdService.getGlobalPricingStorage());
        };

        /**
         * Submit proposal
         */
        $scope.sendProp = function(){
            fdService.submitProposal();
  };

  /**
   * Get transaction info
   * @return {Object} with transaction info
   */
  $scope.getTI = function(){
    return fdService.getTransactionInfo();
  };

  /**
   * Call review order service
   */
  $scope.reviewOrder = function(){
      if($scope.disableReviewOrder)
          return;
      $scope.disableReviewOrder = true;
      var orderId = fdService.getOrderId();
      $rootScope.$emit('Update_address_cart');
      fdService.reviewOrder(orderId)
          .success(function(data, status, headers, config) {
              $scope.disableReviewOrder = false;
              var cart = orderId ? fdService.getOrderedCart(orderId) : fdService.getCart();
              fdService.storeOrderId(data.orderId);
              fdService.storeOrderedCart(data.orderId, cart);
              fdService.clearTmpOrderId();
              $scope.gotoUrl('/checkout/summary');
          })
          .error(function(data, status, headers, config) {
              $scope.disableReviewOrder = false;
              console.log('error');
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
   * return pricing forms OK status
   * @return {boolean}
   */
  $scope.pricingFormsOk = function(){
      if (typeof $rootScope._pricingFormsOk == 'function') {
          return $rootScope._pricingFormsOk();
      }
      return true;
  };

  /**
   * Redirect to the checkout page or transation info
   */
  $scope.proceedToCheckout = function(){
            var ep = fdService.getEquipmentPricingStorage();
            var url;
            if ($rootScope.cart.num_locations > 1 && !$rootScope.cart.num_locations_selected) {
                url = '/multi-locations';
            } else if ($scope.getTI() && ep) {
                url = '/checkout/shipping';
            } else {
                url = '/transaction/info';
            }
            $timeout(function(){
                $scope.gotoUrl(url);
            });
        };

        /**
         * Redirect to checkout page from multi locations
         */
    $scope.proceedToCheckoutML = function(){

    var ep = fdService.getEquipmentPricingStorage();
    if ($scope.getTI() && ep) {
      var url = '/checkout/shipping';
    } else {
      var url = '/transaction/info';
    }
    $timeout(function(){
        $scope.gotoUrl(url);
    });
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
    if ('cart' == $scope.page) {
        return false;
    }

    return true;
  };

    /**
     * Check if products clickable
     * @return {boolean}
     */
    $scope.isProductsClickable = function(){
        if ('thankyou' == $scope.page) {
            return false;
        }
        if ('summary' == $scope.page) {
            return false;
        }
        if ('proposal' == $scope.page) {
            return false;
        }
        if ('cart' == $scope.page) {
            return false;
        }
        return true;
    };

    /**
     * Load unique lease options
     * @param pricingmodel
     */
     $scope.models = function(pricingModel){
         var filteredOptions = [];
         angular.forEach(pricingModel, function(item) {
             var index = filteredOptions.map(function(p){ return p.paymentType; }).indexOf(item.paymentType);
             if (index === -1) {
               filteredOptions.push(item);
             } else {
               filteredOptions[index] = item;
             }
         });
         return filteredOptions;
     };

    /**
     * Payment Type Changed
     * @param product
     */
     $scope.paymentTypeChanged = function(product) {
         var leaseTypes = [];
         var index = 0;
         if (product.termPaymentType == 'Lease') {
           leaseTypes = filterFilter(product.pricingModel, {purchaseType: 'LT'});
           //check for LT36 type lease if available.
           var leaseIndex = leaseTypes.map(function(p) { return p.purchaseType; }).indexOf('LT36');
           index = leaseIndex == -1 ? 0 : leaseIndex;
         } else if (product.termPaymentType == 'Installment') {
           leaseTypes = filterFilter(product.pricingModel, {purchaseType: 'IP'});
         } else if (product.termPaymentType == 'Rent') {
           leaseTypes = filterFilter(product.pricingModel, {purchaseType: 'R'});
         }
         if (leaseTypes.length > 0){
           product.term = leaseTypes[index].purchaseType;
         }
         $scope.qtyChanged();
     };

    /**
     * Change Category
     * @param categoryName
     */
     $scope.changeCategory = function(categoryName){
        if(!$scope.categories){
            fdService.getCategories().success(function(data, status, headers, config) {
                $scope.categories = data;
                $scope.updateCategoryInSession(categoryName);
            })
            .error(function(data, status, headers, config) {
                $location.path('/400');
            });
        } else {
            $scope.updateCategoryInSession(categoryName);
        }
     }

     /**
      * Update Category in Session
      * @param categoryName
      */
     $scope.updateCategoryInSession = function(categoryName){
         var index = $scope.categories.map(function(cat) { return cat.name; }).indexOf(categoryName);
         if(index != -1){
             var category = $scope.categories[index];
             fdService.storeCategoryInSession(category);
             $rootScope.$emit('Category_Change');
         }
     }

  ///////////////// MAIN ////////////////////////////////

  _init();
  
}]);