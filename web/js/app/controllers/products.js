/**
 * Products Controller
 */
app.controller('ProductsCtrl', ['$scope', '$rootScope', '$filter', '$location', '$routeParams', '$timeout', '$anchorScroll', '$window', 'fdService', 'CONST',
    function ($scope, $rootScope, $filter, $location, $routeParams, $timeout, $anchorScroll, $window, fdService, CONST) {

  /**
   * Init function
   * @private
   */
  var _init = function(){

    $rootScope.body_id = 'products';
    $scope.categoryDisabled = true;
    $scope.prodToShow = [];
    $scope.keyword = '';
    $scope.categoryId = null;
    $scope.categories = [];

    $scope.recommendedBundles = [];

    $scope.images = [];
    $scope.cimage = $rootScope.placeholderImageUrl;

    $scope.allProducts = [];
    $scope.products = [];

    // Get Categories
    fdService.getCategories()
      .success(function(data, status, headers, config) {
        $scope.categories = data;
        if ($routeParams.type){
          if ('c' == $routeParams.type) {
            $scope.categoryDisabled = true;
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
          } else if ('t' == $routeParams.type && $routeParams.typename) {
            $scope.productType = $routeParams.typename;

            $timeout(function() {
              $scope.loadMore();
            }, 1);
          } else if('recommended' == $routeParams.type){
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
                console.log('error')
              });
          }
        }
      })
      .error(function(data, status, headers, config) {
        console.log('error')
      });

    // Get all products
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
  };

  /**
   * Change active category
   */
  $scope.changeCategory = function(){
    if(!$scope.$$phase) {
      $scope.$apply();
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
    for(var i = 0; i < 5 || !$scope.prodToShow.length; i++) {
      var key = st + i;
      if (key > $scope.allProducts.length - 1) return;
      $scope.products.push($scope.allProducts[key]);
    }
    
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

  /**
   * Get image thumbnail for product
   * @param imgArray
   * @return {string} image url
   */
  $scope.ProductThumbImg = function(imgArray){
    for(var i in imgArray){
        if(imgArray[i].indexOf('/thumb/') !== -1 ){
            return imgArray[i];
        }
    }
  };

  ///////////////// MAIN ////////////////////////////////
 _init();

}]);
