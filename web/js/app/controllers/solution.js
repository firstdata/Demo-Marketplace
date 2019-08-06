/**
 * Solution Controller
 */
app.controller('SolutionCtrl', ['$scope', '$rootScope', '$filter', '$location', '$routeParams', '$timeout', '$anchorScroll', '$window', 'fdService', 'CONST',
  function($scope, $rootScope, $filter, $location, $routeParams, $timeout, $anchorScroll, $window, fdService, CONST) {

    /**
     * image timeout promise
     */
    var imgPromise;

    /**
     * Init function
     * @private
     */
    var _init = function() {

      $scope.category = fdService.getCategoryFromSession();

      if (!$scope.category) {
        $location.path('/');
        return;
      }

      $rootScope.wrapperClass = 'product-detail';
      $rootScope.wrapperId = 'product';
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

      $scope.monthlyFee = false;
      $scope.transactionFee = false;

      $scope.timestamp = new Date().getTime();

      $scope.page = $routeParams.page;

      $rootScope.cart = $rootScope.cart;
      if (!$routeParams.pid) {
        $location.path('/');
        return;
      }

      $scope.pid = $routeParams.pid;

      fdService.getFeatures($scope.pid)
        .success(function(data, status, headers, config) {
          $scope.features = data;
        })
        .error(function(data, status, headers, config) {
          $scope.features = [];
        });
      fdService.getSpecs($scope.pid)
        .success(function(data, status, headers, config) {
          $scope.specs = data;
        })
        .error(function(data, status, headers, config) {
          $scope.specs = {};
        });

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
          for (var i in $scope.images) {
            if ($scope.images[i].indexOf('/thumb/') !== -1) {
              $scope.thumbImages.push($scope.images[i]);
            }
            if ($scope.images[i].indexOf('/large/') !== -1) {
              $scope.largeImages.push($scope.images[i]);
            }
          }
          $scope.changeImage($scope.thumbImages[0], 0);

        })
        .error(function(data, status, headers, config) {
          $scope.bundle_info = [];
          $location.path('invalid-item');
          $scope.min_lease_amt = 0;
        });

      fdService.getRecommendedBundles($scope.pid)
        .success(function(data, status, headers, config) {
          $scope.recommendedBundles = data;
        })
        .error(function(data, status, headers, config) {
          $scope.recommendedBundles = [];
        });

      fdService.getProductsList($scope.pid)
        .success(function(data, status, headers, config) {
          $scope.includes = data;
        })
        .error(function(data, status, headers, config) {
          $scope.includes = [];
        });

      fdService.getFaqs($scope.pid)
        .success(function(data, status, headers, config) {
          $scope.faqs = data;
        })
        .error(function(data, status, headers, config) {
          $scope.faqs = [];
        });

      $rootScope.$on('Category_Change', function() {
        $scope.category = fdService.getCategoryFromSession();
      });

    };

    /**
     * Get taxes by city and state
     * @method getTaxes
     * @param zip
     * @param city
     */
    $scope.getTaxes = function(zip, city) {
      if (!zip || !city) {
        return;
      }
      fdService.getTaxes(zip, city)
        .success(function(data, status, headers, config) {
          $rootScope.cart.taxPercent = data.salesTax;
          $scope.cartChanged();
        })
        .error(function(data, status, headers, config) {
          $rootScope.cart.taxPercent = -2;
          $scope.cartChanged();
        });
    };


    /**
     * Redirect to the checkout page
     * @method goToCheckout
     * @param disabled
     */
    $scope.goToCheckout = function(disabled) {
      if (disabled || !$rootScope.cart.purchaseEnabled) {
        return;
      }
      $location.path('/checkout/shipping');
    };

    /**
     * Add product to the cart
     * @method addToCart
     * @param {Object} bundle product object
     */
    $scope.addToCart = function(bundle) {
      if (!bundle) {
        bundle = JSON.parse(JSON.stringify($scope.bundle_info));
      } else {
        $anchorScroll();
      }

      var pid = bundle.productId;

      var category = fdService.getCategoryFromSession();

      if (!Object.keys(bundle).length) {
        return;
      }

      var cardNotPresent = bundle.cardNotPresent ? true : false;

      if (bundle.offeringTypes && bundle.offeringTypes.indexOf('Transactions') > -1) {

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
            id: null,
            name: null,
            rate: 0,
            fee: 0,
          },
          qty: 1,
        };

        $rootScope.cart.transaction_products.push(pr);

      } else {

        var pr = {
          id: pid,
          name: bundle.productName,
          price: bundle.price,
          defaultPrice: bundle.price,
          individualPurchaseEnabled: bundle.pinPad,
          pricingModel: bundle.pricingModel,
          productType: bundle.productType,
          term: bundle.defaultPurchaseType,
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
      }

      fdService.resetCartOverridePricing($rootScope.cart);
      fdService.validateCart($rootScope.cart)
        .success(function(data, status, headers, config) {
          $rootScope.cart.validation = data;
          $scope.cartChanged();
          if (data.iscartvalid) {
            fdService.updatePricing(function() {
              $rootScope.cart = fdService.getCart();
            });
          }
        })
        .error(function(data, status, headers, config) {

        });

      $scope.cartChanged();
      fdService.clearOrderId();

      if (window.matchMedia("(max-width: 740px)").matches) {
        $timeout(function() {
          $location.hash('order-summary-container');
          $anchorScroll();
        });
      }


    };

    /**
     * Lease product
     * @method leaseProduct
     * @param {Object} bundle product object
     */
    $scope.leaseProduct = function(bundle) {

      if (!bundle) {
        bundle = JSON.parse(JSON.stringify($scope.bundle_info));
      } else {
        $anchorScroll();
      }

      fdService.resetCartOverridePricing($rootScope.cart);
      fdService.leaseProduct(bundle, $rootScope.cart);
      $scope.cartChanged();


      if (window.matchMedia("(max-width: 740px)").matches) {
        $timeout(function() {
          $location.hash('order-summary-container');
          $anchorScroll();
        });
      }
      fdService.validateCart($rootScope.cart)
        .success(function(data, status, headers, config) {
          $rootScope.cart.validation = data;
          $scope.cartChanged();
          if (data.iscartvalid) {
            fdService.updatePricing(function() {
              $rootScope.cart = fdService.getCart();
            });
          }
        })
        .error(function(data, status, headers, config) {

        });


    };

    /**
     * Cart Changed
     * @method cartChanged
     */
    $scope.cartChanged = function() {
      $rootScope.cart = fdService.cartChanged($rootScope.cart);
    };

    /**
     * Change current active image
     * @method changeImage
     * @param img
     * @param {number} timeout
     */
    $scope.changeImage = function(img, to) {
      if (undefined == to) {
        to = 100;
      }
      if (imgPromise) {
        $timeout.cancel(imgPromise);
      }
      imgPromise = $timeout(function() {
        var cimage = img.replace('/thumb/', '/large/');
        for (var i in $scope.largeImages) {
          if (cimage == $scope.largeImages[i]) {
            $scope.cimage = cimage;
            return;
          } else {
            $scope.cimage = $rootScope.placeholderImageUrl;
          }

        }

      }, to);
    };
    ///////////////// MAIN ////////////////////////////////


    _init();

  }
]);