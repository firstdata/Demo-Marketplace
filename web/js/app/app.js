/**
 * fdApp Module
 */
var app = angular.module('fdApp', ['ngRoute','ui.bootstrap', 'ngResource', 'infinite-scroll']);

/**
 * fdApp routes
 */
app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
    .when('/',{
      controller: 'IndexCtrl',
      templateUrl: 'view/index.html',
      title: 'FD',
      reloadOnSearch: false,
      resolve: {
        page: function($route){
          $route.current.params.page = 'index';
        }
      }
    })
    .when('/product/:pid',{
      controller: 'ProductCtrl',
      templateUrl: 'view/product.html',
      resolve: {
        page: function($route){
          $route.current.params.page = 'product';
        }
      }
    })
    .when('/family/:fid',{
      controller: 'FamilyCtrl',
      templateUrl: 'view/family.html',
      resolve: {
        page: function($route){
          $route.current.params.page = 'family';
        }
      }
    })
    .when('/processing/:id',{
      controller: 'ProcessingCtrl',
      templateUrl: 'view/processing.html',
      resolve: {
        page: function($route){
          $route.current.params.page = 'processing';
        }
      }
    })
    .when('/checkout/shipping',{
      controller: 'CheckoutCtrl',
      templateUrl: 'view/checkout/shipping.html',
      title: 'Shipping Information | FD',
      resolve: {
        page: function($route){
          $route.current.params.ordered = false;
          $route.current.params.one_step = false;
          $route.current.params.page = 'shipping';
        }
      }
    })
    .when('/product/:bid',{
      controller: 'ProductCtrl',
      templateUrl: 'view/product.html',
      resolve: {
        page: function($route){
          $route.current.params.page = 'product';
        }
      }
    })
    .when('/transaction/info',{
      controller: 'TransactionInfoCtrl',
      templateUrl: 'view/transaction_info.html',
      resolve: {
        page: function($route){
          $route.current.params.page = 'transaction_info';
        }
      }
    })
    .when('/checkout/summary',{
      controller: 'CheckoutCtrl',
      templateUrl: 'view/checkout/summary.html',
      title: 'Order Summary | FD',
      resolve: {
        page: function($route){
          $route.current.params.nologin = true;
          $route.current.params.page = 'summary';
        }
      }
    })
    .when('/checkout/thankyou/',{
      controller: 'CheckoutCtrl',
      templateUrl: 'view/checkout/thankyou.html',
      title: 'Thank You | FD',
      resolve: {
        page: function($route){
          $route.current.params.nologin = true;
          $route.current.params.page = 'thankyou';
        }
      }
    })
    .when('/invalid-item',{
      controller: 'ErrorCtrl',
      templateUrl: 'view/invalid-item.html',
      title: 'Invalid Item | FD',
      resolve: {
        page: function($route){
          $route.current.params.nologin = true;
          $route.current.params.page = 'invalid_item';
          $route.current.params.nologin = true;
        }
      }
    })
   .when('/400',{
      controller: 'ErrorCtrl',
      templateUrl: 'view/400.html',
      resolve: {
        page: function($route){
          $route.current.params.nologin = true;
          $route.current.params.page = 'Error';
        }
      }
    })
    .when('/401',{
      controller: 'ErrorCtrl',
      templateUrl: 'view/401.html',
      resolve: {
        page: function($route){
          $route.current.params.nologin = true;
          $route.current.params.page = 'Error';
        }
      }
    })
    .when('/404',{
      controller: 'ErrorCtrl',
      templateUrl: 'view/404.html',
      resolve: {
        page: function($route){
          $route.current.params.nologin = true;
          $route.current.params.page = 'Error';
        }
      }
    })
    .when('/products',{
      controller: 'ProductsCtrl',
      templateUrl: 'view/products.html',
      title: 'Products | First Data',
      resolve: {
        page: function($route){
          $route.current.params.page = 'products';
        }
      }
    })
    .when('/products/:type',{
      controller: 'ProductsCtrl',
      templateUrl: 'view/products.html',
      title: 'Products | First Data',
      resolve: {
        page: function($route){
          $route.current.params.page = 'products';
        }
      }
    })
    .when('/products/:type/:typename',{
      controller: 'ProductsCtrl',
      templateUrl: 'view/products.html',
      title: 'Products | First Data',
      resolve: {
        page: function($route){
          $route.current.params.page = 'products';
        }
      }
    })
    .when('/signup',{
       controller: 'SignupCtrl',
       templateUrl: 'view/signup/index.html',
       title: 'Signup | First Data Marketplace',
       resolve: {
          page: function($route){
            $route.current.params.nologin = true;
          $route.current.params.page = 'signup';
         }
       }
    })
    .when('/terms',{
       controller: 'TCCtrl',
       templateUrl: 'view/signup/tc-rsa.html',
       title: 'Terms & Conditions | First Data Marketplace',
       resolve: {
         page: function($route){
           $route.current.params.nologin = true;
           $route.current.params.page = 'terms';
         }
       }
    })
    .when('/thankyou',{
      controller: 'ThankyouCtrl',
      templateUrl: 'view/signup/confirmation.html',
      title: 'Thank You | FD Signup',
      resolve: {
        page: function($route){
          $route.current.params.nologin = true;
          $route.current.params.page = 'thankyouend';
        }
      }
    })
    .otherwise({ redirectTo: '/404' });
  
}]);

/**
 * Init titles and referrer url
 */
app.run(['$rootScope', function($rootScope) {
  $rootScope.refUrl = '';
  var curUrl;
  
  $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
    if (curUrl) {
      $rootScope.refUrl = curUrl;
    }
    
    curUrl = current.$$route.originalPath;
    if ('/' != curUrl) {
      curUrl = current.$$route.originalPath.replace(/^\/|\/$/g, '');
    }
    
    $rootScope.title = current.$$route ? current.$$route.title : 'FD';
    if (typeof $rootScope.title == 'undefined') {
      $rootScope.title = 'FD';
    }
  });
  
}]);