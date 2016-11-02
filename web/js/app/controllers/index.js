/**
 * Index Controller
 */
app.controller('IndexCtrl', ['$scope', '$rootScope', '$filter', '$location', '$anchorScroll', '$timeout', 'fdService',
    function ($scope, $rootScope, $filter, $location, $anchorScroll, $timeout, fdService) {

  /**
   * Init function
   * @private
   */
  var _init = function(){

    $rootScope.wrapperClass = 'home';
    $rootScope.body_id = 'shop';
    $scope.categories = [];

    fdService.getCategories()
      .success(function(data, status, headers, config) {
        $scope.categories = data;
      })
      .error(function(data, status, headers, config) {
        console.log('error')
      });
  };

  /**
   * Move to anchor
   * @param {string} ancor
   */
  $scope.gotoAnchor = function(anc){
    $timeout(function() {
      $location.hash(anc);
      $anchorScroll();
    });
  };

  /**
   * Change active category
   * @param {Object} category
   */
  $scope.changeCategory = function(category){
    fdService.storeCategoryInSession(category);
    $location.path('/products/c');
  };

  ///////////////// MAIN ////////////////////////////////

  _init();
}]);