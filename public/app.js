'use strict';


angular.module('shoppingCart', [
    'ngRoute',
    'store',
    'solutions',
    'products',
    'shipping'
]).

factory('myService', function() {
 var savedData = {
   items: []
 }
 function set(data) {
   savedData.items.push(data);
   for (var i = 0; i < savedData.items.length; i++) {
//     if (savedData.items[i] != data) {

  //   }
   }

   console.log(savedData.items);

 }
 function get() {
  return savedData.items;
 }

function remove(index) {
  savedData.items.splice(index, 1);
  console.log(savedData);
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
