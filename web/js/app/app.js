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
    .when('/solutions/:sid',{
      controller: 'SolutionCtrl',
      templateUrl: 'view/solution.html',
      resolve: {
        page: function($route){
          $route.current.params.page = 'solutions';
        }
      }
    })
    .when('/product/:pid',{
      controller: 'SolutionCtrl',
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
    .when('/proposal/:orderId/:proposalId',{
      controller: 'ProposalCtrl',
      templateUrl: 'view/proposal.html',
      resolve: {
        page: function($route){
          $route.current.params.nologin = true;
          $route.current.params.page = 'proposal';
        }
      }
    })
    .when('/agreement',{
      controller: 'AgreementCtrl',
      templateUrl: 'view/agreement.html',
      title: 'Merchant Agreement | FD',
      resolve: {
        page: function($route){
          $route.current.params.page = 'Agreement';
        }
      }
    })
    .when('/agreement/:orderID',{
      controller: 'AgreementCtrl',
      templateUrl: 'view/agreement.html',
      title: 'Merchant Agreement | FD',
      resolve: {
        page: function($route){
          $route.current.params.nologin = true;
          $route.current.params.page = 'Agreement';
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
    .when('/checkout/shipping/one',{
      controller: 'CheckoutCtrl',
      templateUrl: 'view/checkout/shipping.html',
      title: 'Shipping Information | FD',
      resolve: {
        page: function($route){
          $route.current.params.ordered = false;
          $route.current.params.one_step = true;
          $route.current.params.page = 'shipping';
        }
      }
    })
    .when('/checkout/cart',{
      controller: 'CheckoutCtrl',
      templateUrl: 'view/checkout/showCart.html',
      title: 'Order Summary | FD',
      resolve: {
        page: function($route){
          $route.current.params.ordered = false;
          $route.current.params.one_step = true;
          $route.current.params.page = 'cart';
        }
      }
    })
    .when('/checkout/shipping/prop',{
      controller: 'CheckoutCtrl',
      templateUrl: 'view/checkout/shipping.html',
      title: 'Shipping Information | FD',
      resolve: {
        page: function($route){
          $route.current.params.nologin = true;
          $route.current.params.ordered = true;
          $route.current.params.one_step = false;
          $route.current.params.page = 'shipping';
        }
      }
    })
    .when('/product/:bid',{
      controller: 'SolutionCtrl',
      templateUrl: 'view/product.html',
      resolve: {
        page: function($route){
          $route.current.params.page = 'product';
        }
      }
    })
    .when('/guideme/:cid',{
      controller: 'GuideMeCtrl',
      templateUrl: 'view/guideme.html',
      resolve: {
        page: function($route){
          $route.current.params.page = 'guideme';
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
    .when('/checkout/thankyou/:oid/:h',{
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
    .when('/products/:pid/recommended-products',{
      controller: 'RecommendedProductsCtrl',
      templateUrl: 'view/recommended_products.html',
      title: 'Recommended Products | First Data',
      resolve: {
        page: function($route){
          $route.current.params.page = 'Recommended Products';
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
    .when('/options/:typename',{
      controller: 'OptionsCtrl',
      templateUrl: 'view/options.html',
      title: 'Options | First Data',
      resolve: {
        page: function($route){
          $route.current.params.page = 'options';
        }
      }
    })
    .when('/verify-identity/:orderID',{
      controller: 'VerifyIdentityCtrl',
      templateUrl: 'view/signup/questions.html',
      title: 'Verify Identity | First Data',
      resolve: {
        page: function($route){
          $route.current.params.nologin = true;
          $route.current.params.page = 'questions';
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
    .when('/signup/owner',{
       controller: 'SignupOwnerCtrl',
       templateUrl: 'view/signup/owner.html',
       title: 'Signup | First Data Marketplace',
       resolve: {
          page: function($route){
            $route.current.params.nologin = true;
            $route.current.params.page = 'signup-owner';
         }
       }
    })
    .when('/signup/location',{
       controller: 'SignupLocationCtrl',
       templateUrl: 'view/signup/location.html',
       title: 'Signup | First Data Marketplace',
       resolve: {
          page: function($route){
            $route.current.params.nologin = true;
            $route.current.params.page = 'signup-location';
         }
       }
    })
    .when('/signup/location/:num',{
       controller: 'SignupLocationCtrl',
       templateUrl: 'view/signup/location.html',
       title: 'Signup | First Data Marketplace',
       resolve: {
          page: function($route){
            $route.current.params.nologin = true;
            $route.current.params.page = 'signup-location';
         }
       }
    })
    .when('/signup/setup',{
       controller: 'SignupSetupCtrl',
       templateUrl: 'view/signup/setup.html',
       title: 'Signup | First Data Marketplace',
       resolve: {
          page: function($route){
            $route.current.params.nologin = true;
            $route.current.params.page = 'signup-setup';
         }
       }
    })
    .when('/signup/terms', {
        controller: 'SignupTermsCtrl',
        templateUrl: 'view/signup/terms.html',
        title: 'Terms & Conditions | First Data Marketplace',
        resolve: {
            page: function($route) {
                $route.current.params.eSignature = true;
                $route.current.params.nologin = true;
                $route.current.params.page = 'merchant-agreement';
            }
        }
    })
    .when('/signup/terms/:orderID', {
        controller: 'SignupTermsCtrl',
        templateUrl: 'view/signup/terms.html',
        title: 'Terms & Conditions | First Data Marketplace',
        resolve: {
            page: function($route) {
                $route.current.params.eSignature = true;
                $route.current.params.nologin = true;
                $route.current.params.page = 'merchant-agreement';
            }
        }
    })
    .when('/signup/terms/:orderID/:ownerID', {
        controller: 'SignupTermsCtrl',
        templateUrl: 'view/signup/terms.html',
        title: 'Terms & Conditions | First Data Marketplace',
        resolve: {
            page: function($route) {
                $route.current.params.eSignature = true;
                $route.current.params.nologin = true;
                $route.current.params.page = 'merchant-agreement';
            }
        }
    })
    .when('/verify/:orderID/:verifyCode',{
      controller: 'VerifyCtrl',
      templateUrl: 'view/signup/verify.html',
      title: 'Signup | First Data Marketplace',
      resolve: {
        page: function($route){
          $route.current.params.nologin = true;
          $route.current.params.page = 'verify';
        }
      }
    })
    .when('/terms',{
       controller: 'TCCtrl',
       templateUrl: 'view/signup/tc-rsa.html',
       title: 'Terms & Conditions | First Data Marketplace',
       resolve: {
         page: function($route){
           $route.current.params.eSignature = true;
           $route.current.params.nologin = true;
           $route.current.params.page = 'terms';
         }
       }
    })
    .when('/forgot-password',{
      controller: 'ForgotCtrl',
      templateUrl: 'view/forgot.html',
      title: 'Forgot Password | First Data Marketplace',
      resolve: {
        page: function($route){
          $route.current.params.nologin = true;
          $route.current.params.page = 'forgot';
        }
      }
    })
    .when('/merchantOrders', {
        controller: 'OrdersCtrl',
        templateUrl: 'view/ordersDisplay.html',
        title: 'Merchant Orders | First Data Marketplace',
        resolve: {
            page: function($route) {
                $route.current.params.page = 'merchant_orderspage';
            }
        }
    })
    .when('/merchantAuditTrail', {
        controller: 'AuditTrailCtrl',
        templateUrl: 'view/ordersAuditTrail.html',
        title: 'Merchant Orders Audit Trail | First Data Marketplace',
        resolve: {
            page: function($route) {
                $route.current.params.page = 'merchant_orders_audit_trailpage';
            }
        }
    })
    .when('/remoteContract/:orderID', {
        controller: 'TCCtrl',
        templateUrl: 'view/signup/tc-rsa.html',
        title: 'Terms & Conditions | First Data Marketplace',
        resolve: {
            page: function($route){
               $route.current.params.eSignature = true;
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
    .when('/multi-locations',{
       controller: 'MultiLocationsCtrl',
       templateUrl: 'view/multi-locations.html',
       title: 'Number of Locations | First Data Marketplace',
       resolve: {
           page: function($route){
              $route.current.params.page = 'multi-locations';
           }
       }
    })
    .otherwise({ redirectTo: '/404' });
  
}]);

app.config([
  '$httpProvider',
  function($httpProvider) {

    $httpProvider.interceptors.push(['$rootScope', '$q', '$location', function($rootScope, $q, $location) {
      return {
        'response': function(response) {
          if(response.status === 200 && response.config.method === 'POST'){
            $rootScope.$emit('resetSessionTimeout');
          }
          return response || $q.when(response);
        },
        'responseError': function(response) {

          var status = response.status;
          var data = response.data;
          if (status === 401) {
            if (data.redirectUrl){
              $rootScope.$emit('logout', [data]);
            } else {
              $location.path('/401');
            }
          } else if (status === 404) {
            $location.path('/404');
          } else if (status === 400 || status === 409 || status === 503 || status === -1) {
            //Caller will handle
          } else {
            $location.path('/400');
          }
          return $q.reject(response);
        }
      };
    }]);
  }
]);

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