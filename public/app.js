'use strict';


angular.module('shoppingCart', [
    'ngRoute',
    'store',
    'solutions',
    'products',
    'shipping',
    'confirmation'
]).

factory('myService', function() {
 var savedData = {
   items: []
 }
 function set(data) {
   savedData.items.push(data);
 }
 function get() {
  return savedData.items;
 }
  function remove(index) {
    savedData.items.splice(index, 1);
  }

 return {
  set: set,
  get: get,
  remove: remove
 }

}).

config(['$routeProvider', function($routeProvider) {

    $routeProvider.otherwise({
        redirectTo: '/store'
    });
}]);
