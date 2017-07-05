/**
 * E-Signature Controller
 */
app.controller('EsignatureCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {

  /**
   * Init function
   * @private
   */
  var _init = function(){

    $scope.showAll = false;
    $scope.showContinue = false;
    $rootScope.$on('Agreement_Unsigned', function() {
        $scope.showAll = true;
    });

  };

  $scope.clickContinue = function () {
    $scope.showAll = false;
  };

  ///////////////// MAIN ////////////////////////////////

  _init();

}]);