/**
 * Product Controller
 */
app.controller('ProductCtrl', ['$scope', '$rootScope', '$filter', '$location', '$routeParams', '$timeout', '$anchorScroll', '$window', 'fdService', 'CONST',
    function ($scope, $rootScope, $filter, $location, $routeParams, $timeout, $anchorScroll, $window, fdService, CONST) {


  /**
   * Image Change Timeout Promise
   */
  var imgPromise;

  /**
   * Init function
   * @private
   */
  var _init = function(){

    $scope.timestamp = new Date().getTime();
    $rootScope.cart.taxPercent = 9; //set sales tax = 9%

    $scope.page = $routeParams.page;

    $rootScope.cart = $rootScope.cart;

    $rootScope.body_id = 'product-detail';

    $scope.bundle_info = {};
    $scope.includes = [];
    $scope.features = [];
    $scope.faqs = [];
    $scope.specs = {};
    $scope.recommendedBundles = [];
    $scope.min_lease_amt = 0;

    $scope.images = [];
    $scope.cimage = $rootScope.placeholderImageUrl;

    if (!$routeParams.pid){
      $location.path('/');
      return;
    }

    $scope.pid = $routeParams.pid;

    // Get product features
    fdService.getFeatures($scope.pid)
      .success(function(data, status, headers, config) {
        $scope.features = data;
      })
      .error(function(data, status, headers, config) {
        $scope.features = [];
        console.log('error')
      });

    // Get product specifications
    fdService.getSpecs($scope.pid)
      .success(function(data, status, headers, config) {
        $scope.specs = data;
      })
      .error(function(data, status, headers, config) {
        $scope.specs = {};
        console.log('error')
      });

    // Get product details
    fdService.getProduct($scope.pid)
      .success(function(data, status, headers, config) {
        $scope.bundle_info = data;
        $scope.images = $scope.bundle_info.imageUrls ? $scope.bundle_info.imageUrls : [];

        $rootScope.title = $scope.bundle_info.productName;
        $rootScope.recommendedProductName = $scope.bundle_info.productName;
        $scope.min_lease_amt = 0;
        if (data.pricingModel && data.pricingModel.length) {
          for (var i = 0; i < data.pricingModel.length; i++) {
            if (CONST.PURCHASE_CODE != data.pricingModel[i].purchaseType && data.pricingModel[i].defaultAmt && (!$scope.min_lease_amt || data.pricingModel[i].defaultAmt < $scope.min_lease_amt)) {
              $scope.min_lease_amt = data.pricingModel[i].defaultAmt;
            }
          }
        }
        $scope.thumbImages = [];
        $scope.largeImages = [];
        for(var i in $scope.images){
          if($scope.images[i].indexOf('/thumb/') !== -1){
            $scope.thumbImages.push($scope.images[i]);
          }
          if($scope.images[i].indexOf('/large/') !== -1){
            $scope.largeImages.push($scope.images[i]);
          }
        }
        $scope.changeImage($scope.thumbImages[0]);

      })
      .error(function(data, status, headers, config) {
        $scope.bundle_info = [];
        $location.path('invalid-item');
        $scope.min_lease_amt = 0;
        console.log('error')
      });

    // Get Recommended bundles for this product
    fdService.getRecommendedBundles($scope.pid)
      .success(function(data, status, headers, config) {
        $scope.recommendedBundles = data;
      })
      .error(function(data, status, headers, config) {
        $scope.recommendedBundles = [];
        console.log('error')
      });

    // Get Products List
    fdService.getProductsList($scope.pid)
      .success(function(data, status, headers, config) {
        $scope.includes = data;
      })
      .error(function(data, status, headers, config) {
        $scope.includes = [];
        console.log('error')
      });

    // Get FAQ list for product
    fdService.getFaqs($scope.pid)
      .success(function(data, status, headers, config) {
        $scope.faqs = data;
      })
      .error(function(data, status, headers, config) {
        $scope.faqs = [];
        console.log('error')
      });
  };

  /**
   * Redirect to checkout
   * @param {Boolean} do nothing if true
   */
  $scope.goToCheckout = function(disabled){
    if (disabled || !$rootScope.cart.purchaseEnabled) {
      return;
    }
    $location.path('/checkout/shipping');
  };

  /**
   * Add product to the cart
   * @param {Object} product
   */
  $scope.addToCart = function(bundle){
    if (!bundle) {
      bundle = JSON.parse(JSON.stringify($scope.bundle_info));
    } else {
      $anchorScroll();
    }
    
    var pid = bundle.productId;
    
    if (!Object.keys(bundle).length) {
      return;
    }
    if ($rootScope.cart.data[pid]){
      var qty = parseInt($rootScope.cart.data[pid].qty);
      if (qty < 10) {
        qty++;
        $rootScope.cart.data[pid].qty = qty.toString();
      }
    } else {
      $rootScope.cart.data[pid] = {
          id: pid,
          name: bundle.productName,
          price: bundle.price,
          individualPurchaseEnabled: bundle.pinPad,
          pricingModel: bundle.pricingModel,
          productType: bundle.productType,
          term: CONST.PURCHASE_CODE,
          pmodel: null,
          qty: "1"
      };
    }

    // Validate if cart is ready to checkout
    fdService.validateCart($rootScope.cart)
      .success(function(data, status, headers, config) {
        $rootScope.cart.validation = data;
        $scope.cartChanged();
      })
      .error(function(data, status, headers, config) {
        console.log('error');
      });
    
    $scope.cartChanged();
    fdService.clearOrderId();

    //Scroll to the cart in case of small screen
    if (window.matchMedia("(max-width: 740px)").matches) {
      $timeout(function() {
        $location.hash('order-summary-container');
        $anchorScroll();
      });
    }

    // Update pricing
    fdService.updatePricing();
  };

  /**
   * Lease product
   * @param {Object} product
   */
  $scope.leaseProduct = function(bundle){
    
    if (!bundle) {
      bundle = JSON.parse(JSON.stringify($scope.bundle_info));
    } else {
      $anchorScroll();
    }
    
    fdService.leaseProduct(bundle, $rootScope.cart);
    $scope.cartChanged();

    //Scroll to the cart in case of small screen
    if (window.matchMedia("(max-width: 740px)").matches) {
      $timeout(function() {
        $location.hash('order-summary-container');
        $anchorScroll();
      });
    }

    // Update pricing
    fdService.updatePricing();

    // Validate if cart is ready to checkout
    fdService.validateCart($rootScope.cart)
      .success(function(data, status, headers, config) {
        $rootScope.cart.validation = data;
        $scope.cartChanged();
      })
      .error(function(data, status, headers, config) {
        console.log('error');
      });
  };

  /**
   * Calling in case of changing cart.
   */
  $scope.cartChanged = function(){
    $rootScope.cart = fdService.cartChanged($rootScope.cart);
  };

  /**
   * Change active image
   * @param {String} img
   */
  $scope.changeImage = function(img) {
      if (imgPromise) {
        $timeout.cancel(imgPromise);
      }
      imgPromise = $timeout(function() {
        var cimage = img.replace('/thumb/','/large/');
        for(var i in $scope.largeImages){
            if(cimage == $scope.largeImages[i]){
                $scope.cimage = cimage;
                return;
            }
            else{
                $scope.cimage = $rootScope.placeholderImageUrl;
            }
        }
      }, 100);
  };
  ///////////////// MAIN ////////////////////////////////
  _init();
}]);