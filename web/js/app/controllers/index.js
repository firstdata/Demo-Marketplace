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

    $rootScope.show_search = true;

    $scope.heroBundles = [];
    $scope.alacarteBundles = [];
    $scope.categories = [];
    $scope.mcc_code = null;
    $scope.mcc_codes = [];
    $scope.guideMeOnly = false;

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

  $scope.filterHero = function(p){
    if (p['tags']) {
      if (p['tags'].indexOf('HOME') != -1) {
        return true;
      }
    }
    return false;
  };

  /**
   * Change active category
   * @param {Object} category
   */
  /*$scope.changeCategory = function(id){
    fdService.getCategory(id)
      .success(function(data, status, headers, config) {
        fdService.storeCategoryInSession(data);
        $location.path('/products/c');
      })
      .error(function(data, status, headers, config) {
      });
  };*/
    $scope.changeCategory = function(category){
      fdService.storeCategoryInSession(category);
      $location.path('/products/c');
    };

  ///////////////// MAIN ////////////////////////////////

  _init();
}]);