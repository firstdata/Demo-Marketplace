/**
 * Thank You Controller
 */
app.controller('ThankyouCtrl', ['$scope', '$rootScope', '$filter', '$location', '$routeParams', 'fdService',
  function ($scope, $rootScope, $filter, $location, $routeParams, fdService) {

  /**
   * Init function
   * @private
   */
  var init = function(){
    $rootScope.body_id = 'ty';
    $rootScope.bodyClass = 'ty';
  };

  /**
   * Redirect to the main page
   */
  $scope.learnMore = function(){
    $location.path('/');
  };
  ///////////////// MAIN ////////////////////////////////
  init();
}]);