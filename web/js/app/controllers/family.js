/**
 * Family Controller
 */
app.controller('FamilyCtrl', ['$scope', '$rootScope', '$window', 'fdService', '$routeParams', '$location', '$anchorScroll','CONST',
    function ($scope, $rootScope, $window, fdService, $routeParams, $location, $anchorScroll, CONST) {

  /**
   * Init function
   * @private
   */
  var _init = function(){
    $rootScope.body_id = 'product-detail';
    $scope.family = [];
    $scope.productInfo = [];
    $scope.recommendedBundles = [];
    $scope.includes = [];
    $scope.faqs = [];
    $scope.features = [];
    $scope.specs = {};
    $scope.fid = $routeParams.fid;

    if (!$scope.fid) {
      $location.path('invalid-item');
      return;
    }

    $rootScope.cart = fdService.getCart();
    fdService.getProductOptions($scope.fid)
      .success(function(data, status, headers, config) {
        $scope.family = data;

        if ($scope.family.options && $scope.family.options.length){
          console.log($scope.family.options)
          $scope.loadProduct($scope.family.options[0].productId);
        }
      })
      .error(function(data, status, headers, config) {
        $scope.family = [];
        console.log('error');
      });

  };

  /**
   * Load product information by product Id
   * @param id {int} product Id
   */
  $scope.loadProduct = function(id){
    $scope.productId = id;
    fdService.getProduct(id)
      .success(function(data, status, headers, config) {
        $scope.productInfo = data;
      })
      .error(function(data, status, headers, config) {
        $scope.productInfo = [];
        console.log('error')
      });
  
      fdService.getRecommendedBundles(id)
        .success(function(data, status, headers, config) {
          $scope.recommendedBundles = data;
        })
        .error(function(data, status, headers, config) {
          $scope.recommendedBundles = [];
          console.log('error')
        });

      fdService.getFaqs(id)
        .success(function(data, status, headers, config) {
          $scope.faqs = data;
        })
        .error(function(data, status, headers, config) {
          $scope.faqs = [];
          console.log('error')
        });
      
      fdService.getFeatures(id)
        .success(function(data, status, headers, config) {
          $scope.features = data;
        })
        .error(function(data, status, headers, config) {
          $scope.features = [];
          console.log('error')
        });
      fdService.getSpecs(id)
        .success(function(data, status, headers, config) {
          $scope.specs = data;
        })
        .error(function(data, status, headers, config) {
          $scope.specs = {};
          console.log('error')
        });
  };

  /**
   * Add product to cart
   * @param {Object} bundle
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
          term: CONST.OWNED_CODE, //Owned
          pmodel: null,
          qty: "1"
      };
    }
    
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
    

    if (window.matchMedia("(max-width: 740px)").matches) {
      $timeout(function() {
        $location.hash('order-summary-container');
        $anchorScroll();
      });
    }
    fdService.updatePricing();
    
  };

  /**
   * Redirect to checkout
   * @param {boolean} if true, do nothing
   */
  $scope.goToCheckout = function(disabled){
    if (disabled || !$rootScope.cart.purchaseEnabled) {
      return;
    }
    $location.path('/checkout/shipping');
  };

  /**
   * Call this method when cart was changed
   */
  $scope.cartChanged = function(){
    $rootScope.cart = fdService.cartChanged($rootScope.cart);
  };
  
  ///////////////// MAIN ////////////////////////////////
  _init();
  
}]);