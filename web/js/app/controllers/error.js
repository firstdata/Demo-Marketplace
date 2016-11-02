/**
 * Error Controller
 *
 */
app.controller('ErrorCtrl', ['$scope', '$location', 'fdService', '$window',
    function ($scope, $location, fdService, $window) {

  /**
   * Init function
   * @private
   */
  var _init = function(){
  };

  /**
   * redirect to the previous page
   */
  $scope.goBack = function() {
    $window.history.back();
  };
  
  ///////////////// MAIN ////////////////////////////////
  _init();
  
}]);