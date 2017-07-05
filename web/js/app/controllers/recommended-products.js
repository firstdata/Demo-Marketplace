/**
 * Recommended Products controller
 */
app.controller('RecommendedProductsCtrl', ['$scope', '$rootScope', '$filter', '$location', '$routeParams', '$anchorScroll', '$window', 'fdService', 'CONST',
  function($scope, $rootScope, $filter, $location, $routeParams, $anchorScroll, $window, fdService, CONST) {
    $rootScope.body_id = 'products';

    /**
     * Product Thumb Image
     * @method ProductThumbImg
     * @param {} imgArray
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
     * Init function
     * @method _init
     */
    var _init = function() {
      $scope.recommendedBundles = [];
      $scope.isRecommendedCallDone = false;
      $scope.pid = $routeParams.pid;
      fdService.getRecommendedBundles($scope.pid)
        .success(function(data, status, headers, config) {
          $scope.recommendedBundles = data;
          $scope.isRecommendedCallDone = true;
        })
        .error(function(data, status, headers, config) {
          $scope.recommendedBundles = [];
          $scope.isRecommendedCallDone = true;
        });
    };

    ///////////////// MAIN ////////////////////////////////

    _init();

  }
]);