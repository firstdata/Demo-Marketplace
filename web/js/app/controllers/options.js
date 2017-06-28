/**
 * Options Controller
 */
app.controller('OptionsCtrl', ['$scope', '$rootScope', '$location', '$routeParams', '$anchorScroll', '$window', 'fdService', '$timeout','$filter', 'CONST',
  function($scope, $rootScope, $location, $routeParams, $anchorScroll, $window, fdService, $timeout,$filter, CONST) {
    $rootScope.body_id = 'product-detail';

    /**
     * Product Thumb Image
     * @param imgArray
     * @return {}
     */
    $scope.ProductThumbImg = function(imgArray) {
      if (imgArray.length == 0) {
        return $rootScope.placeholderImageUrl;
      }
      for (var i in imgArray) {
        if (imgArray[i].indexOf('/thumb/') !== -1) {
          return imgArray[i];
        }
      }
    };

    /**
     * Add product to cart
     * @param {Object} product object
     */
    $scope.addToCart = function(product){

        var cart = fdService.getCart();

        var category = fdService.getCategoryFromSession();
        var cardNotPresent = product.cardNotPresent ? true : false;

        var family = product.parentProduct;

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
            qty: 1,
          };

          cart.transaction_products.push(pr);


        } else {
          var fid = family.id;

          if (!Object.keys(family).length) {
            return;
          }

          if (!cart.payment_types || fid != cart.payment_types.id) {
            cart.payment_types = {
              id: fid,
              name: family.name,
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
          }
        }



        $rootScope.cart = fdService.cartChanged(cart);

        fdService.validateCart($rootScope.cart)
            .success(function(data, status, headers, config) {
                $rootScope.cart.validation = data;
                $rootScope.cart = fdService.cartChanged($rootScope.cart);
                if(data.iscartvalid)
                    fdService.updatePricing();
            })
            .error(function(data, status, headers, config) {
                console.log('error');
            });

        fdService.clearOrderId();


        if (window.matchMedia("(max-width: 740px)").matches) {
            $timeout(function() {
                $location.hash('order-summary-container');
                $anchorScroll();
            });
        }
    };

    /**
     * Init function
     * @private
     */
    var _init = function() {
      $scope.productType = $routeParams.typename;
      $rootScope.cart = fdService.getCart();
      if($rootScope.cart.validation.carterrors){
          $scope.sortedValidation = $filter('orderBy')($rootScope.cart.validation.carterrors, '_errorOrder');
          var currentCartError = $scope.sortedValidation[0];
          $scope.productDisplayName = currentCartError.errormessage;
      } else{
          $scope.productDisplayName = $scope.productType.charAt(0) + $scope.productType.substr(1).toLowerCase();
      }

      fdService.getProductsByOptionType($scope.productType)
        .success(function(data, status, headers, config) {
          $scope.products = data;
        })
        .error(function(data, status, headers, config) {
          $scope.products = [];
        });
    };

    ///////////////// MAIN ////////////////////////////////
    _init();

  }
]);