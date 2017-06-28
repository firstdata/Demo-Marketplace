/**
 * Products Controller
 */
app.controller('ProductsCtrl', ['$scope', '$rootScope', '$filter', '$location', '$routeParams', '$timeout', '$anchorScroll', '$window', 'fdService', 'CONST',
    function ($scope, $rootScope, $filter, $location, $routeParams, $timeout, $anchorScroll, $window, fdService, CONST) {
    $rootScope.body_id = 'products';

    $scope.categoryDisabled = false;

    $scope.prodToShow = [];

    $scope.keyword = '';

    $scope.categoryId = null;
    $scope.categories = [];

    $scope.bundle_info = {};
    $scope.includes = [];
    $scope.features = [];
    $scope.faqs = [];
    $scope.specs = {};
    $scope.recommendedBundles = [];

    $scope.images = [];
    $scope.cimage = $rootScope.placeholderImageUrl;

    $scope.allProducts = [];
    $scope.products = [];


//  $scope.showCheckout = false;
    $scope.monthlyFee = false;
    $scope.transactionFee = false;

  /**
   * Change active category
   */
  $scope.changeCategory = function(){
    if(!$scope.$$phase) {
      $scope.$apply();
    }

    if ($scope.category) {
      $scope.businessCategory = [$scope.category];
      fdService.storeCategoryInSession($scope.category);
    }

    $scope.generateAcData($scope.allProducts);
    $scope.loadMore();
  };

  /**
   * search products
   */
  $scope.search = function(){
    if(!$scope.$$phase) {
      $scope.$apply();
    }
    $scope.loadMore();
  };

  /**
   * Sort products by tag filter
   * @param {Object} product
   * @return {number}
   */
  $scope.sortbytag = function(p){
    if (p['tags'] && p['tags'].indexOf('TOP 10') != -1) {
      return 0;
    }
    return 1;
  }

  /**
   * Filter featured products
   * @param {Object} product
   * @return {boolean}
   */
  $scope.filterHero = function(p){
    if (p['tags']) {
      if (p['tags'].indexOf('HOME') != -1) {
        return true;
      }
    }
    return false;
  };

  /**
   * Filter products
   * @param {Object} product
   * @return {boolean}
   */
  $scope.filterProd = function(p){

    var ret = true;
    if ($scope.productType) {
      if (p['productType'] == $scope.productType) {
        ret = true;
      } else {
        ret = false;
      }
    }
    if ($scope.businessCategory && $scope.businessCategory.length) {
      ret = false;
      if (p['categoryIds']) {
        for (var i = 0; i < $scope.businessCategory.length; i++) {
          if (p['categoryIds'].indexOf(parseInt($scope.businessCategory[i].id)) != -1) {
            ret = true;
            break;
          }
        }
      }
    }
    if (!$scope.keyword || !$scope.keyword.length || p.productName.toLowerCase().indexOf($scope.keyword.toLowerCase()) != -1) {
      ret = ret && true;
    } else {
      if (p['tags'] && p['tags'].indexOf($scope.keyword) != -1) {
        ret = ret && true;
      } else {
        ret = false;
      }
    }
    return ret;
  };

  /**
   * Generate autocomplete data
   * @param data
   * @return {Array}
   */
  $scope.generateAcData = function(data){
    
    var acData = [];
    
    for (var i in data){
      var p = data[i];
      var incl = true;
      if ($scope.businessCategory && $scope.businessCategory.length) {
        incl = false;
        if (p['categoryIds']) {
          for (var k = 0; k < $scope.businessCategory.length; k++) {
            if (p['categoryIds'].indexOf(parseInt($scope.businessCategory[k].id)) != -1) {
              incl = true
              break;
            }
          }
        }
      }
      if (!incl) {
        continue;
      }
      
      if (acData.indexOf(p.productName) == -1) {
        acData.push(p.productName);
      }
      for ( var k in p.tags) {
        if (acData.indexOf(p.tags[k]) == -1) {
          acData.push(p.tags[k]);
        }
      }
    }
    
    $("#search-products" ).autocomplete({
      delay: 0,
      select: function(event, ui){
        $scope.keyword = ui.item.value;
        $scope.search();
      },
      source: acData
    });
    
    return acData;
  };

  /**
   * load more products for the infinite loop
   */
  $scope.loadMore = function(){
    if ($scope.products.length >= $scope.allProducts.length) return;
    
    var st = $scope.products.length;
    // for(var i = 0; i < 5 || !$scope.prodToShow.length; i++) {
    for(var i = 0; i < 5; i++) {
      var key = st + i;
      if (key > $scope.allProducts.length - 1) return;
      $scope.products.push($scope.allProducts[key]);
    }
    $timeout(function() {
      if ($scope.prodToShow.length < 5) {
        $scope.loadMore();
      }
    });
    };

//  fdService.getHeroBundles()
//    .success(function(data, status, headers, config) {
//      console.log(data)
//      $scope.featuredProducts = data;
//
//    })
//    .error(function(data, status, headers, config) {
//      console.log('error')
//    });

    fdService.getAllProducts()
        .success(function(data, status, headers, config) {
          $scope.allProducts = [];

          for (var i in data){
            var p = data[i];
            if (p.productType.indexOf('FEE') != -1) {
              continue;
            }
            if (p.productWithOptions) {
              p.prod_url = 'family/' + p.productFamilyId;
            } else if ('ACQUIRING' == p.productType) {
              p.prod_url = 'processing/' + p.productId;
            } else {
              p.prod_url = 'product/' + p.productId;
            }
            $scope.allProducts.push(p);
          }

          $scope.generateAcData($scope.allProducts);

          $scope.loadMore();
        })
        .error(function(data, status, headers, config) {
          $scope.allProducts = [];
          $scope.generateAcData([]);
        });

    $scope.getTaxes = function(zip, city){
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
            console.log('error')
          });
  };

  /**
   * Redirect to the checkout page
   * @param disabled
   */
  $scope.goToCheckout = function(disabled){
    if (disabled || !$rootScope.cart.purchaseEnabled) {
      return;
    }
    $location.path('/checkout/shipping');
  };

    $scope.addToCart = function(bundle){

      if (!bundle) {
        bundle = JSON.parse(JSON.stringify($scope.bundle_info));
      } else {
        $anchorScroll();
      }
      var bid = bundle.productId;

      if (!Object.keys(bundle).length) {
        return;
      }
      var category = fdService.getCategoryFromSession();

      var cardNotPresent = bundle.cardNotPresent ? true : false;


      var pr = {
        id: bid,
        name: bundle.productName,
        price: bundle.price,
        individualPurchaseEnabled: bundle.pinPad,
        pricingModel: bundle.pricingModel,
        productType: bundle.productType,
        term: bundle.defaultPurchaseType,
        pmodel: null,
        category: category.name,
        cardNotPresent: cardNotPresent,
        productType: bundle.productType,
        qty: 1
      };

      var index = fdService.getCartProductIndex($rootScope.cart, pr);

      if (-1 !== index){
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

      // if ($rootScope.cart.data[bid]){
      //   var qty = parseInt($rootScope.cart.data[bid].qty);
      //   if (qty < 10) {
      //     qty++;
      //     $rootScope.cart.data[bid].qty = qty;
      //   }
      // } else {
      //   $rootScope.cart.data[bid] = {
      //     id: bid,
      //     name: bundle.productName,
      //     price: bundle.price,
      //     individualPurchaseEnabled: bundle.pinPad,
      //     pricingModel: bundle.pricingModel,
      //     productType: bundle.productType,
      //     term: CONST.PURCHASE_CODE,
      //     pmodel: null,
      //     category: category.name,
      //     cardNotPresent: cardNotPresent,
      //     productType: bundle.productType,
      //     qty: "1"
      //   };
      // }

      fdService.validateCart($rootScope.cart)
          .success(function(data, status, headers, config) {
            $rootScope.cart.validation = data;
            $scope.cartChanged();
            if(data.iscartvalid)
              fdService.updatePricing();
          })
          .error(function(data, status, headers, config) {
            console.log('error');
          });

      $scope.cartChanged();
      fdService.clearOrderId();

//    $scope.showCheckout = true;

      if (window.matchMedia("(max-width: 740px)").matches) {
        $timeout(function() {
          $location.hash('order-summary-container');
          $anchorScroll();
        });
      }
    };

    $scope.cartChanged = function(){
      $rootScope.cart = fdService.cartChanged($rootScope.cart);
    };

    var imgPromise;

    $scope.changeImage = function(img) {
      if (imgPromise) {
        $timeout.cancel(imgPromise);
      }
      imgPromise = $timeout(function() {
        $scope.cimage = img;
      }, 100);
    };


  /**
   * Get image thumbnail for product
   * @param imgArray
   * @return {string} image url
   */
  $scope.ProductThumbImg = function(imgArray){
      if(imgArray.length == 0){
        return $rootScope.placeholderImageUrl;
      }
    for(var i in imgArray){
        if(imgArray[i].indexOf('/thumb/') !== -1 ){
            return imgArray[i];
        }
    }
  };

    var _init = function(){

      if ('t' == $routeParams.type && $routeParams.typename) {
        $scope.productType = $routeParams.typename;

        if ($scope.productType != 'ACQUIRING') {
          $scope.categoryDisabled = false;
          fdService.getCategories().success(function(data, status, headers, config) {
              var c = fdService.getCategoryFromSession();
              $scope.categories = data;
              if (c) {
                $scope.category = c;
                $timeout(function() {
                  $scope.loadMore();
                }, 1);
              } else {
                $scope.category = null;
              }
            })
            .error(function(data, status, headers, config) {
              $location.path('/400');
            });
        } else {
          $scope.categoryDisabled = true;
          $timeout(function() {
            $scope.loadMore();
          }, 1);
        }

      } else {
        fdService.getCategories().success(function(data, status, headers, config) {
          $scope.categoryDisabled = false;
          var c = fdService.getCategoryFromSession();
          $scope.categories = data;

          var c = fdService.getCategoryFromSession();
          if (c) {
            $scope.category = c;
            $scope.businessCategory = [c];
            $timeout(function() {
              angular.element('#categoryfilter').trigger('change');
              $scope.loadMore();
            }, 1);
          } else {
            $scope.category = null;
          }
        });

        if ('c' == $routeParams.type) {

          var c = fdService.getCategoryFromSession();
          if (c) {
            $scope.category = c;
            $scope.businessCategory = [c];
            $timeout(function() {
              angular.element('#categoryfilter').trigger('change');
              $scope.loadMore();
            }, 1);
          } else {
            $scope.category = null;
          }
        } else if('recommended' == $routeParams.type){ //Showing recommended products as part of FDMP-3298
          $scope.productContentType = $routeParams.type;
          $scope.isRecommendedCallDone = false;
          var pid = $routeParams.typename;
          fdService.getRecommendedBundles(pid)
              .success(function(data, status, headers, config) {
                $scope.recommendedBundles = data;
                $scope.isRecommendedCallDone = true;
              })
              .error(function(data, status, headers, config) {
                $scope.recommendedBundles = [];
                $scope.isRecommendedCallDone = true;
              });
        }

      }
    };

  ///////////////// MAIN ////////////////////////////////
 _init();

}]);
