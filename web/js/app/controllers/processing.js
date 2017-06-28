/**
 * Processing Controller
 */
app.controller('ProcessingCtrl', ['$scope', '$rootScope', '$window', 'fdService', '$routeParams', '$location', '$anchorScroll', 'CONST', '$timeout',
  function($scope, $rootScope, $window, fdService, $routeParams, $location, $anchorScroll, CONST, $timeout) {

    /**
     * Init function
     * @private
     */
    var _init = function() {
      $scope.id = $routeParams.id;
      $rootScope.body_id = 'product-detail';
      $scope.family = [];
      $scope.faqs = [];
      $scope.features = [];

      $rootScope.cart = fdService.getCart();

      //Redirect if no product Id provided
      if (!$scope.id) {
        $location.path('404');
        return;
      }

      fdService.getProductOptions($scope.id)
        .success(function(data, status, headers, config) {
          $scope.family = data;
          $rootScope.recommendedProductName = $scope.family.productName;
          $scope.bundle_info = {};
          $scope.bundle_info.productName = $scope.family.productName;

        })
        .error(function(data, status, headers, config) {
          $location.path('invalid-item');
        });


      fdService.getFaqs($scope.id)
        .success(function(data, status, headers, config) {
          $scope.faqs = data;
        })
        .error(function(data, status, headers, config) {
          $scope.faqs = [];
          console.log('error');
        });

      fdService.getFeatures($scope.id)
        .success(function(data, status, headers, config) {
          $scope.features = data;
        })
        .error(function(data, status, headers, config) {
          $scope.features = [];
          console.log('error');
        });

      $scope.timestamp = new Date().getTime();
      fdService.getProductsList($scope.id)
        .success(function(data, status, headers, config) {
          $scope.includes = data;
        })
        .error(function(data, status, headers, config) {
          $scope.includes = [];
          console.log('error');
        });
      //Get Recommended products list.
      fdService.getRecommendedBundles($scope.id)
        .success(function(data, status, headers, config) {
          $scope.recommended = data;
        })
        .error(function(data, status, headers, config) {
          $scope.recommended = [];
          console.log('error');
        });

    };

    /**
     * Add processing product to cart
     * @method addToCart
     * @param {Object} parent product
     * @param {Object} product
     */
    $scope.addToCart = function(family, product) {

      var cart = fdService.getCart();

      var category = fdService.getCategoryFromSession();
      var cardNotPresent = product.cardNotPresent ? true : false;

      if (!family) {

      if (-1 !== cart.transaction_products.map(function(e) { return e.id; }).indexOf(product.productId)) {
          return;
        }

        var pr = {
          id: product.productId,
          name: product.productName,
          price: product.price,
          type: product.productType,
          term: product.defaultPurchaseType,
          category: category.name,
          cardNotPresent: cardNotPresent,
          parentProduct: {
            id: null,
            name: null,
            rate: 0,
            fee: 0,
          },
          qty: 1,
        };

        cart.transaction_products.push(pr);


      } else {
        var fid = family.productId;

        if (!Object.keys(family).length) {
          return;
        }

        if (!cart.payment_types || fid != cart.payment_types.id) {
          cart.payment_types = {
            id: fid,
            name: family.productName,
            products: {},
          };
        }
        cart.payment_types.products[product.productId] = {
          id: product.productId,
          name: product.productName,
          price: product.price,
          type: product.productType,
          term: product.defaultPurchaseType,
          category: category.name,
          cardNotPresent: cardNotPresent,
          qty: 1,
        };
      }



      $rootScope.cart = fdService.cartChanged(cart);

      fdService.validateCart($rootScope.cart)
        .success(function(data, status, headers, config) {
          $rootScope.cart.validation = data;
          $rootScope.cart = fdService.cartChanged($rootScope.cart);
          $scope.cartChanged();
          if (data.iscartvalid)
            fdService.updatePricing();
        })
        .error(function(data, status, headers, config) {
          console.log('error');
        });

      fdService.clearOrderId();

      //Scroll to the cart in case of small screen
      if (window.matchMedia("(max-width: 740px)").matches) {
        $timeout(function() {
          $location.hash('order-summary-container');
          $anchorScroll();
        });
      }
    };

    /**
     * Redirect to the checkout page
     * @method goToCheckout
     * @param {Boolean} if true do nothing
     */
    $scope.goToCheckout = function(disabled) {
      if (disabled || !$rootScope.cart.purchaseEnabled) {
        return;
      }
      $location.path('/checkout/shipping');
    };

    /**
     * Calling in case of changing cart.
     * @method cartChanged
     */
    $scope.cartChanged = function() {
      $rootScope.cart = fdService.cartChanged($rootScope.cart);
    };

    /**
     * Scroll to anchor
     * @method gotoAnchor
     * @param {String} anchor
     */
    $scope.gotoAnchor = function(anc) {
      $timeout(function() {
        $location.hash(anc);
        $anchorScroll();
      });
    };

    ///////////////// MAIN ////////////////////////////////
    _init();

  }
]);