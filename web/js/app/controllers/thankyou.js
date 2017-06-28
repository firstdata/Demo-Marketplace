/**
 * Thank You Controller
 */
app.controller('ThankyouCtrl', ['$scope', '$rootScope', '$filter', '$location', '$routeParams', 'fdService', '$window',
  function ($scope, $rootScope, $filter, $location, $routeParams, fdService, $window) {

  /**
   * Init function
   * @private
   */
  var _init = function(){
    $rootScope.body_id = 'ty';
    $rootScope.bodyClass = 'ty';
      $scope.thankyouPageFlag = $rootScope.thankyouPageFlag;
  };

  /**
   * Redirect to the main page
   */
  $scope.learnMore = function(){
      fdService.clearCDSession();
      if(GLOBAL_OPTIONS.platform_name == 'td')
        $window.location.href = 'https://www.tdbank.com/small_business/merchant_solutions.html';
      else if(GLOBAL_OPTIONS.platform_name == 'key')
          $window.location.href = 'https://www.key.com/business/index.jsp';
      else
        $window.location.href = 'https://www.firstdata.com/en_us/home.html';

  };
  ///////////////// MAIN ////////////////////////////////
    _init();
}]);