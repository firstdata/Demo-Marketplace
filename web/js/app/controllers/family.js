/**
 * Family Controller
 */
app.controller('FamilyCtrl', ['$scope', '$rootScope', '$window', 'fdService', '$routeParams', '$location', '$anchorScroll', 'CONST',
  function($scope, $rootScope, $window, fdService, $routeParams, $location, $anchorScroll, CONST) {

    /**
     * Init function
     * @private
     */
    var _init = function() {
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

          if ($scope.family.options && $scope.family.options.length) {
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
     * @method loadProduct
     * @param id {int} product Id
     */
    $scope.loadProduct = function(id) {
      $scope.productId = id;
      fdService.getProduct(id)
        .success(function(data, status, headers, config) {
          $scope.productInfo = data;
        })
        .error(function(data, status, headers, config) {
          $scope.productInfo = [];
          console.log('error');
        });

      fdService.getRecommendedBundles(id)
        .success(function(data, status, headers, config) {
          $scope.recommendedBundles = data;
        })
        .error(function(data, status, headers, config) {
          $scope.recommendedBundles = [];
          console.log('error');
        });

      fdService.getFaqs(id)
        .success(function(data, status, headers, config) {
          $scope.faqs = data;
        })
        .error(function(data, status, headers, config) {
          $scope.faqs = [];
          console.log('error');
        });

      fdService.getFeatures(id)
        .success(function(data, status, headers, config) {
          $scope.features = data;
        })
        .error(function(data, status, headers, config) {
          $scope.features = [];
          console.log('error');
        });
      fdService.getSpecs(id)
        .success(function(data, status, headers, config) {
          $scope.specs = data;
        })
        .error(function(data, status, headers, config) {
          $scope.specs = {};
          console.log('error');
        });
    };

    /**
     * Add product to cart
     * @method addToCart
     * @param {Object} bundle
     * @param {} family
     */
    $scope.addToCart = function(bundle, family) {

      if (!bundle) {
        bundle = JSON.parse(JSON.stringify($scope.bundle_info));
      } else {
        $anchorScroll();
      }

      var category = fdService.getCategoryFromSession();

      var pid = bundle.productId;

      if (!Object.keys(bundle).length) {
        return;
      }

      var cardNotPresent = bundle.cardNotPresent ? true : false;

      if (bundle.offeringTypes && -1 === bundle.offeringTypes.indexOf("Transactions")) {



        var pr = {
          id: pid,
          name: bundle.productName,
          price: bundle.price,
          individualPurchaseEnabled: bundle.pinPad,
          pricingModel: bundle.pricingModel,
          productType: bundle.productType,
          term: bundle.defaultPurchaseType, //Owned
          pmodel: null,
          category: category.name,
          cardNotPresent: cardNotPresent,
          qty: 1
        };

        var index = fdService.getCartProductIndex($rootScope.cart, pr);


        if (-1 !== index) {
          pr = $rootScope.cart.data[index];
          pr.qty++;
          pr.price = bundle.price;
          pr.defaultPrice = bundle.price;
          if (pr.qty > 10) {
            pr.qty = 10;
          }

          $rootScope.cart.data[index] = pr;
        } else {
          $rootScope.cart.data.push(pr);
        }
      } else {

        if (-1 !== $rootScope.cart.transaction_products.map(function(e) { return e.id; }).indexOf(bundle.productId)) {
          return;
        }

        var pr = {
          id: bundle.productId,
          name: bundle.productName,
          price: bundle.price,
          type: bundle.productType,
          term: bundle.defaultPurchaseType,
          category: category.name,
          cardNotPresent: cardNotPresent,
          parentProduct: {
            id: family.productId,
            name: family.productName,
            rate: 0,
            fee: 0,
          },
          qty: 1,
        };

        $rootScope.cart.transaction_products.push(pr);

      }

      fdService.validateCart($rootScope.cart)
        .success(function(data, status, headers, config) {
          $rootScope.cart.validation = data;
          $scope.cartChanged();
          if (data.iscartvalid)
            fdService.updatePricing();
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
     * @method goToCheckout
     * @param {} disabled
     */
    $scope.goToCheckout = function(disabled) {
      if (disabled || !$rootScope.cart.purchaseEnabled) {
        return;
      }
      $location.path('/checkout/shipping');
    };

    /**
     * Call this method when cart was changed
     * @method cartChanged
     * @return
     */
    $scope.cartChanged = function() {
      $rootScope.cart = fdService.cartChanged($rootScope.cart);
    };

    ///////////////// MAIN ////////////////////////////////
    _init();

  }
]);