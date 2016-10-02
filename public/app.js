'use strict';


angular.module('shoppingCart', [
    'ngRoute',
    'store',
    'solutions',
    'products'
]).
config(['$routeProvider', function($routeProvider) {

    $routeProvider.otherwise({
        redirectTo: '/store'
    });
}]);
