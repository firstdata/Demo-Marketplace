'use strict';


angular.module('shoppingCart', [
    'ngRoute',
    'store',
    'solutions',
    'products',
    'shipping',
    'confirmation',
    'application'
]).

factory('FDService', function() {
  var category = '';
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
  function getCategory() {
    return category;
  }
  function setCategory(cat) {
    category = cat;
  }

 return {
  set: set,
  get: get,
  remove: remove,
  getCategory: getCategory,
  setCategory: setCategory
 }
}).

config(['$routeProvider', function($routeProvider) {

    $routeProvider.otherwise({
        redirectTo: '/store'
    });
}]);
