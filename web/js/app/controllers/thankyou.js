/**
 * Thank You Controller
 */
app.controller('ThankyouCtrl', ['$scope', '$rootScope', '$filter', '$location', '$routeParams', 'fdService', '$window',
  function($scope, $rootScope, $filter, $location, $routeParams, fdService, $window) {

    /**
     * Init function
     * @private
     */
    var _init = function() {
      $rootScope.body_id = 'ty';
      $rootScope.bodyClass = 'ty';
      $scope.thankyouPageFlag = $rootScope.thankyouPageFlag;
    };

    /**
     * Redirect to the main page
     * @method learnMore
     */
    $scope.learnMore = function() {
      $window.location.href = 'https://www.firstdata.com/en_us/home.html';
    };
    ///////////////// MAIN ////////////////////////////////
    _init();
  }
]);